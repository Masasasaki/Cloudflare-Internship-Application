addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Class to handle elements sent by the
 * HTML Rewriter
 */
class ElementHandler {
  constructor(variantNum) {
    this.variantNum = variantNum
  }
  element(element) {
    if (this.variantNum === 0) { // First variant
      if (element.tagName === "title") {
        element.setInnerContent("Super Cool Website")
      } else if (element.tagName === "h1") {
        element.setInnerContent("Hi! My name is Masaki Asanuma.")
      } else if (element.tagName === "p") {
        element.setInnerContent("I am an aspiring full-stack developer currently studying Computer Science at Georgia Tech!")
      } else if (element.tagName === "a") {
        element.setAttribute("href", "https://findtheinvisiblecow.com/")
        element.setInnerContent("My favorite website I discovered in quarantine")
      }
    } else { // Second Variant
      if (element.tagName === "title") {
        element.setInnerContent("Hey what's up")
      } else if (element.tagName === "h1") {
        element.setInnerContent("How are you doing?")
      } else if (element.tagName === "p") {
        element.setInnerContent("This take-home project is SO much more fun compared to the stressful algorithmic interviews. Thank you cloudflare for this opportunity!")
      } else if (element.tagName === "a") {
        element.setAttribute("href", "https://pointerpointer.com/")
        element.setInnerContent("Here's a pretty cool website")
      }
    }
  }
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  // Fetching the variants array
  const variants = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
    .then(res => res.json())
    .then(data => data.variants)

  // 50/50 chance getting either 0 or 1 determining which variant to choose
  let random = Math.floor(Math.random() * 2)
  let variantURL = variants[random] 

  // Check the cookie to see if the user is returning
  // If the user is returning, set url to the one in the cookie
  const cookie = request.headers.get('Cookie') 
  if (cookie && cookie.indexOf('url') !== -1) {
    random = Number(cookie.substring(cookie.length - 1)) - 1
    variantURL = cookie.substring(cookie.indexOf('url')+4)
  }

  // Fetching the variant from the url
  const response = await fetch(variantURL)

  // Must create a cloned new response to modify the header
  const newResponse = new Response(response.body, response)

  // Append the directed url to the cookie
  newResponse.headers.append('Set-Cookie', `url=${variantURL}`)

  // Used the HTMLRewriter to rewrite some of the attributes
  const rewriter = new HTMLRewriter()
    .on('title', new ElementHandler(random))
    .on('h1', new ElementHandler(random))
    .on('p', new ElementHandler(random))
    .on('a', new ElementHandler(random))

  return rewriter.transform(newResponse)
}
