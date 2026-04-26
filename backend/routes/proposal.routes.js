import express from 'express';
import {
    createProposal,
    getFarmerProposals,
    getOfftakerProposals,
    updateProposalStatus
} from '../controllers/proposal.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', authenticate, createProposal);
router.get('/farmer', authenticate, getFarmerProposals);
router.get('/offtaker', authenticate, getOfftakerProposals);
router.put('/:proposalId/status', authenticate, updateProposalStatus);

export default router;
