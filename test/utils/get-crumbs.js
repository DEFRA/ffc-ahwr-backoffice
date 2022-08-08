/**
 * Make a request to the `url` to get the value of the crumb (CSRF token). This
 * ensures subsequent requests will be valid.
 *
 * @param {object} server Hapi server to inject request to.
 * @param {object} [options] object containing [url='/'] and
 * [crumbKey='crumb']. `url` is where the request is made to and `crumbKey` is
 * the name of the cookie containing the crumb.
 * @param {function} [mockForRequest=()=>{}] function containing any mocks
 * required for the `url` of the request.
 * @returns {string} value of crumb.
 */
module.exports = async (server, options = { url: '/cookies', crumbKey: 'crumb' }, mockForRequest = () => {}) => {
  mockForRequest()
  const { crumbKey, url } = options
  const res = await server.inject({ method: 'GET', url })
  const cookieHeader = res.headers['set-cookie']

  const regex = new RegExp(`${crumbKey}=([^",;\\\x7F]*)`)
  const crumb = cookieHeader[0].match(regex)[1]
  if (!crumb) {
    throw Error(`Crumb was not found, ensure name of cookie key is set to '${crumbKey}'.`)
  }
  return crumb
}
