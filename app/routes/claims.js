const Joi = require("joi")
const { administrator, authoriser, processor, recommender, user } = require("../auth/permissions")


module.exports = {
    method: 'GET',
    path: '/claims/{reference?}',
    options: {
        auth: { scope: [administrator, authoriser, processor, recommender, user  ] },
        validate: {
        },
        handler: async (request, h) => {
    
        return h.view('claims', {
            
        })
        }
    }
}