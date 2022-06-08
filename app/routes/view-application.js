const rows = [
    { key: { text: 'SBI number:' }, value: { text: 107264765 }, actions: { items: [ { href: "#", text: "Change" } ] } },
    { key: { text: 'Address:' }, value: { text: 'Cotton Drive, Mill Hill, Linford, Hitchin SG5 3DR'}, actions: { items: [ { href: "#", text: "Change" } ] } },
    { key: { text: 'Email address:' }, value: { text: 'r.patel@gmail.com' }, actions: { items: [ { href: "#", text: "Change" } ] } },
  ]

module.exports = {
    method: 'GET',
    path: '/view-application',
    options: {
      auth: false,
      handler: async (_, h) => {
        return h.view('view-application', { applicationId: 'HDJ2124F', listData: { rows } })
      }
    }
  }
  