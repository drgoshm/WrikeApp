
const getCookie = (name) => {
  /* eslint-disable */
  let matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'))
  /* eslint-enable */
  return matches ? decodeURIComponent(matches[1]) : undefined
}

const setCookie = (name, value, options) => {
  let _options = options || {}
  let expires = _options.expires
  if (typeof expires === 'number' && expires) {
    var d = new Date()
    d.setTime(d.getTime() + expires * 1000)
    expires = d
  }
  if (expires && expires.toUTCString) {
    expires = expires.toUTCString()
  }
  value = encodeURIComponent(value)
  var updatedCookie = name + '=' + value
  for (var propName in _options) {
    updatedCookie += '; ' + propName
    var propValue = _options[propName]
    if (propName === 'expires') {
      updatedCookie += '=' + expires
    } else if (propValue !== true) {
      updatedCookie += '=' + propValue
    }
  }
  document.cookie = updatedCookie
}

const fieldNameParse = (name, module) => {
  if (name && name.includes('/')) {
    let split = name.split('/')
    return {
      module: split[0],
      name: split[1]
    }
  }
  return name
}

const subscribe = (store, pull, push) => {
  store.subscribe(mutation => {
    let _pull = pull || store.state.cookies.pull
    let _push = push || store.state.cookies.push
    if (_pull.hasOwnProperty(mutation.type)) {
      if (Array.isArray(_pull[mutation.type])) {
        for (let index in _pull[mutation.type]) {
          let value = getCookie(_pull[mutation.type][index].name)
          store.commit(_pull[mutation.type][index].commit, value)
        }
      } else {
        let value = getCookie(_pull[mutation.type].name)
        store.commit(_pull[mutation.type].commit, value)
      }
    }
    if (_push.hasOwnProperty(mutation.type)) {
      if (Array.isArray(_push[mutation.type])) {
        for (let index in _push[mutation.type]) {
          let field = _push[mutation.type][index]
          let parsedName = fieldNameParse(field.name)
          console.log(`Cookie ${parsedName.module} :: ${parsedName.name}`)
          let value = parsedName.module ? store.state[parsedName.module][parsedName.name] : store.state[parsedName.name]
          if (typeof field.options === 'function') {
            setCookie(field.name, value, field.options(store))
          } else {
            setCookie(field.name, value, field.options)
          }
        }
      } else {
        let field = _push[mutation.type]
        let parsedName = fieldNameParse(field.name)
        let value = parsedName.module ? store.state[parsedName.module][parsedName.name] : store.state[parsedName.name]
        if (typeof _push[mutation.type].options === 'function') {
          setCookie(field.name, value, field.options(store))
        } else {
          setCookie(field.name, value, field.options)
        }
      }
    }
  })
}

/*
 * pull_mutations = {
 *  'SET_TOKEN': [
 *   {
 *     name: '<state field name>',
 *     commit: '<mutation name>'
 *   }
 * ],
 *}
 * push_mutations = {
 *  'SET_TOKEN': [
 *   {
 *     name: '<state field name>'
 *     options: [] -or- value => { return [] }
 *   }
 * ],
 *}
*/
export function CookiesPlugin (pull, push) {
  return store => {
    subscribe(store, pull, push)
  }
}

export default (store) => {
  subscribe(store)
}
