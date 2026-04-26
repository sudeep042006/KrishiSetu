import CropPrice from '../models/cropPrice.js';

export const getCropPricesByLocation = async (req, res) => {
    try {
        // Read the query parameters sent from the React Native app
        const { state, district, commodity } = req.query;

        // Build the database query dynamically
        let query = {};

        // We use RegExp with 'i' to make the search case-insensitive 
        // (e.g., matching "nagpur" from the map with "Nagpur" in the DB)
        const districtStr = (district || "").toString().trim();
        const commodityStr = (commodity || "").toString().trim();
        const stateStr = (state || "").toString().trim();

        // Helper to escape regex special characters
        const escapeRegex = (str) => str ? str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';

        if (stateStr) query.state = new RegExp(`^${escapeRegex(stateStr)}$`, 'i');
        if (districtStr) query.district = new RegExp(`^${escapeRegex(districtStr)}$`, 'i');
        if (commodityStr) query.commodity = new RegExp(`^${escapeRegex(commodityStr)}$`, 'i');

        // Fetch the prices, sorting by the newest arrival date first
        let prices = await CropPrice.find(query)
            .sort({ arrivalDate: -1 })
            .limit(50);

        // FALLBACK LOGIC: If no specific results found
        if (!prices || prices.length === 0) {
            console.log(`No specific results for ${districtStr} - ${commodityStr}. Trying fuzzy fallback...`);
            
            // 1. Try searching for just the Commodity in any district
            if (commodityStr) {
                prices = await CropPrice.find({ 
                    commodity: new RegExp(`${escapeRegex(commodityStr)}`, 'i') 
                })
                .sort({ arrivalDate: -1 })
                .limit(20);
            }
            
            // 2. If still nothing, try searching for just the District (fuzzy match)
            if ((!prices || prices.length === 0) && districtStr) {
                prices = await CropPrice.find({ 
                    district: new RegExp(`${escapeRegex(districtStr)}`, 'i') 
                })
                .sort({ arrivalDate: -1 })
                .limit(20);
            }

            // 3. Last Resort: Just return the 10 most recent prices across the whole system
            if (!prices || prices.length === 0) {
                prices = await CropPrice.find({})
                    .sort({ arrivalDate: -1 })
                    .limit(10);
            }
        }

        if (!prices || prices.length === 0) {
            return res.status(404).json({ message: "No data available in the system yet." });
        }

        res.status(200).json(prices);

    } catch (error) {
        console.error("Error fetching crop prices:", error);
        res.status(500).json({ message: "Server error while fetching prices." });
    }
};