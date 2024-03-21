const Joi = require("joi")
const { administrator, authoriser, processor, recommender, user } = require("../auth/permissions")
const { getApplications } = require("../api/applications")

module.exports = {
    method: 'GET',
    path: '/multiple-claims',
    options: {
        auth: { scope: [administrator, authoriser, processor, recommender, user  ] },
        validate: {
        },
        handler: async (request, h) => {
    
        return h.view('multiple-claims', {
            
        })
        }
    }
}