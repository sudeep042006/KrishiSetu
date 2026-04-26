import Proposal from '../models/Proposal.js';
import User from '../models/User.js';

export const createProposal = async (req, res) => {
    try {
        const { farmerId, cropName, quantity, unit, pricePerUnit, deliveryDate, message } = req.body;
        const offtakerId = req.user.id;

        if (!farmerId || !cropName || !quantity || !pricePerUnit || !deliveryDate) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const proposal = new Proposal({
            offtakerId,
            farmerId,
            cropName,
            quantity,
            unit: unit || 'Quintal',
            pricePerUnit,
            deliveryDate,
            message
        });

        await proposal.save();

        res.status(201).json({
            success: true,
            message: 'Proposal sent successfully to farmer.',
            proposal
        });
    } catch (error) {
        console.error('Create Proposal Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getFarmerProposals = async (req, res) => {
    try {
        const farmerId = req.user.id;
        const proposals = await Proposal.find({ farmerId })
            .populate('offtakerId', 'name profilePhoto companyName phoneNumber location')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            proposals
        });
    } catch (error) {
        console.error('Get Farmer Proposals Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getOfftakerProposals = async (req, res) => {
    try {
        const offtakerId = req.user.id;
        const proposals = await Proposal.find({ offtakerId })
            .populate('farmerId', 'name profilePhoto phoneNumber location')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            proposals
        });
    } catch (error) {
        console.error('Get Offtaker Proposals Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateProposalStatus = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const { status } = req.body;

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const proposal = await Proposal.findById(proposalId);

        if (!proposal) {
            return res.status(404).json({ success: false, message: 'Proposal not found' });
        }

        // Only the farmer can update the status
        if (proposal.farmerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this proposal' });
        }

        proposal.status = status;
        await proposal.save();

        res.status(200).json({
            success: true,
            message: `Proposal ${status.toLowerCase()} successfully`,
            proposal
        });
    } catch (error) {
        console.error('Update Proposal Status Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
