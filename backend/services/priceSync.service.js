import axios from 'axios';
import cron from 'node-cron';
import CropPrice from '../models/cropPrice.js';

const API_KEY = '579b464db66ec23bdd0000017b4d310a68064a6869fc6232f93eded7';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070'; 

// Helper function to fix government date formats
const parseDate = (dateString) => {
    if (!dateString) return new Date(); 
    const standardDate = new Date(dateString);
    if (!isNaN(standardDate.getTime())) return standardDate;

    const parts = dateString.split(/[\/\-]/);
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; 
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    return new Date(); 
};

export const syncAgmarketData = async () => {
    console.log("🚀 Starting Data.gov.in Price Sync via API...");

    const limit = 2000; // Grab 2,000 records at a time (Safe batch size)
    let offset = 0;     // Start at the very beginning
    let hasMoreData = true;
    let totalSaved = 0;

    try {
        // Keep looping until the government API says "no more data"
        while (hasMoreData) {
            console.log(`⏳ Fetching records ${offset} to ${offset + limit}...`);

            const response = await axios.get(`https://api.data.gov.in/resource/${RESOURCE_ID}`, {
                params: {
                    'api-key': API_KEY,
                    'format': 'json',
                    'limit': limit,
                    'offset': offset // Tell the API where to start reading from
                }
            });

            const records = response.data.records;

            // If the API returns an empty array, we've reached the end of the data!
            if (!records || records.length === 0) {
                console.log("🏁 Reached the end of the dataset.");
                hasMoreData = false;
                break;
            }

            // 1. Filter out bad rows
            const validRecords = records.filter(item => item.commodity && item.state);

            // 2. Prepare the super-fast Bulk Write array
            const bulkOperations = validRecords.map((item) => ({
                updateOne: {
                    filter: { 
                        commodity: item.commodity, 
                        state: item.state, 
                        district: item.district, 
                        market: item.market,
                        arrivalDate: parseDate(item.arrival_date) 
                    },
                    update: { 
                        $set: {
                            modalPrice: parseFloat(item.modal_price) || 0,
                            minPrice: parseFloat(item.min_price) || 0,
                            maxPrice: parseFloat(item.max_price) || 0
                        }
                    },
                    upsert: true // Insert if new, update if exists
                }
            }));

            // 3. Execute the Bulk Write for this batch
            if (bulkOperations.length > 0) {
                const result = await CropPrice.bulkWrite(bulkOperations, { ordered: false });
                totalSaved += (result.upsertedCount + result.modifiedCount);
            }

            // 4. Increase the offset to grab the NEXT page on the next loop
            offset += limit;
        }

        console.log(`✅ COMPLETE! Successfully processed and saved ${totalSaved} total records.`);

    } catch (error) {
        console.error("❌ Error fetching from Data.gov.in:", error.response?.data || error.message);
    }
};

export const startPriceSyncJob = () => {
    // Set to 2:00 AM daily for production
    cron.schedule('18 4 * * *', () => {
        syncAgmarketData();
    });
    console.log("⏰ API Price Sync Job Scheduled for 2:00 AM daily.");
};