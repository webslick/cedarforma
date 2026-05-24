const leadService = require('../services/lead-service');
const { CedarLeadPhoto } = require('../db/models');
class LeadController {
async createLead(req, res, next) {
  try {
    const lead = await leadService.createLead(req.body, {
      skipTelegram: true,
    });

    const files = req.files || [];

    if (files.length) {
      await CedarLeadPhoto.bulkCreate(
        files.map((file) => ({
          leadId: lead.id,
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/leads/${file.filename}`,
        }))
      );
    }

    const leadWithPhotos = await leadService.getLeadByIdWithPhotos(lead.id);

    await leadService.sendLeadTelegramNotification(leadWithPhotos || lead);

    return res.status(201).json({
      success: true,
      lead: leadWithPhotos || lead,
    });
  } catch (error) {
    if (error.message === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, errors: error.errors });
    }

    next(error);
  }
}

  async getAllLeads(req, res, next) {
    try {
      const leads = await leadService.getAllLeads(req.query);
      return res.json({ success: true, leads });
    } catch (error) {
      next(error);
    }
  }

  async getLeadEvents(req, res, next) {
    try {
      const events = await leadService.getLeadEvents(req.params.id);
      return res.json({ success: true, events });
    } catch (error) {
      next(error);
    }
  }

  async updateLead(req, res, next) {
    try {
      const lead = await leadService.updateLead(req.params.id, req.body, {
        source: 'admin',
        name: req.admin?.name || req.admin?.login || 'Админка',
      });
      return res.json({ success: true, lead });
    } catch (error) {
      next(error);
    }
  }

  async updateLeadStatus(req, res, next) {
    try {
      const lead = await leadService.updateLeadStatus(req.params.id, req.body.status, {
        source: 'admin',
        name: req.admin?.name || req.admin?.login || 'Админка',
      });
      return res.json({ success: true, lead });
    } catch (error) {
      next(error);
    }
  }

  async deleteLead(req, res, next) {
    try {
      await leadService.deleteLead(req.params.id, {
        source: 'admin',
        name: req.admin?.name || req.admin?.login || 'Админка',
      });
      return res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeadController();
