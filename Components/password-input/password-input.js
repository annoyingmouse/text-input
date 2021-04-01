(() => {
  const template = document.createElement('template')
  const ghost_template = document.createElement('template')
  const thisPath = document.currentScript.getAttribute('src')
  const compPath = thisPath.split('.').slice(0, -1).join('.')
  template.innerHTML = `
    <style>
      @import "${compPath}.css";
    </style>
    <div>
      <input type="password" autocomplete="current-password">
      <label></label>
      <span></span>
    </div>
  `
  ghost_template.innerHTML = `
    <input tabindex="-1"
           style="width: 0; height: 0; border: none;">
  `

  const rootPath = thisPath.split('/').slice(0, -1).join('/')
  if(!document.querySelector(`script[src='${rootPath}/zxcvbn/zxcvbn.js']`)){
    const script = document.createElement('script')
    script.setAttribute('src', `${rootPath}/zxcvbn/zxcvbn.js`)
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('async', 'true')
    const firstScript = document.getElementsByTagName('script')[0]
    firstScript.parentNode.insertBefore(script, firstScript)
  }

  const generateFeedback = result => {
    const arr = []
    if(result.feedback.warning) {
      const warning = document.createElement('strong')
      warning.appendChild(document.createTextNode(result.feedback.warning.replace(/([^.])$/, '$1.')))
      arr.push(warning)
    }
    if(result.feedback.suggestions.length){
      arr.push(document.createTextNode(result.feedback.suggestions.map(i => i.replace(/([^.])$/, '$1.')).join(' ')))
    }
    return arr
  }
  const sanitiseName = value => value.replace(/[\s!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '').toLowerCase()

  /**
   * @customElement password-input
   *
   * @description This wraps a text input, a label and a span with a div element. The span acts as the warning should
   * there be an issue with the value
   *
   * @property value {string} the value contained within the text input, updated by input.
   *
   * @property placeholder {string} both the label and invisible placeholder and becomes the "safe" `id` of the input
   * and the value of the `for` of the label
   *
   * @property required {boolean} indicates whether an empty value is acceptable, or will trigger the warning. I think
   * this counts as a Boolean but in reality - if it the attribute exists then validation will occur.
   *
   * @property autocomplete {string} this will only work if the input is within a form which has a submit button.
   * There is a list of values here: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete and
   * more details here: https://developers.google.com/web/updates/2015/06/checkout-faster-with-autofill
   *
   * @example <caption>Ask a user for their first name</caption>
   *
   * <input-text placeholder="First name"
   *             value="Dominic"
   *             required></input-text>
   */
  class PasswordInput extends HTMLElement {
    static get observedAttributes() {
      return [
        'value',
        'placeholder',
        'autocomplete',
        'check',
        'replicates'
      ]
    }

    constructor() {
      super()
      this.shadow = this.attachShadow({
        mode: 'closed'
      })
      this.shadow.appendChild(template.content.cloneNode(true))
      this.label = this.shadow.querySelector('label')
      this.input = this.shadow.querySelector('input')
      this.span = this.shadow.querySelector('span')
    }

    connectedCallback() {
      if (this.input.isConnected) {
        this.input.addEventListener('blur', this.blurListener)
        this.input.addEventListener('input', this.inputListener)
        if(this.original){
          this.original.addEventListener('input', this.inputOriginalListener)
        }
        if(this.hasAttribute('name')){
          this.appendChild(ghost_template.content.cloneNode(true))
          this.ghost = this.querySelector('input')
          this.ghost.id = this.getAttribute('name')
          this.ghost.name = this.getAttribute('name')
          this.ghost.value = this.value
        }
      }

    }

    detachedCallback() {
      this.input.removeEventListener('blur', this.blurListener)
      this.input.removeEventListener('input', this.inputListener)
      this.original.removeEventListener('input', this.inputOriginalListener)
    }

    blurListener = event => {
      if (!event.target.value && this.hasAttribute('required')) {
        this.invalid = true
        this.span.innerText = `The field '${this.placeholder}' is required.`
        this.removeAttribute('strength')
      } else if(this.hasAttribute('replicates')) {
        if(this.original.value !== event.target.value){
          this.invalid = true
          this.span.innerText = `The field '${this.placeholder}' does not match the '${this.original.getAttribute('placeholder')}' field.`
        }else{
          this.invalid = false
        }
      } else{
        this.invalid = false
      }
    }

    inputListener = event => {
      this.value = event.target.value
      if (event.target.value && this.hasAttribute('required')) {
        this.invalid = false
      }
      if(this.hasAttribute('check')) {
        const result = zxcvbn(event.target.value)
        this.strength = result.score
        if(result.feedback.suggestions){
          this.span.innerText = ''
          generateFeedback(result).forEach(item => this.span.appendChild(item))
        }
      }else{
        this.span.innerText = this.placeholder + (this.hasAttribute('required')
          ? ''
          : ' (Optional)')
      }
    }

    inputOriginalListener = (event) => {
      if(this.value && (this.value !== event.target.value)){
        this.invalid = true
        this.span.innerText = `The field '${this.placeholder}' does not match the '${this.original.getAttribute('placeholder')}' field.`
      }else{
        this.invalid = false
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      const attributeHandler = {
        autocomplete: function(comp) {
          comp.input.setAttribute('autocomplete', comp.getAttribute('autocomplete'))
        },
        value: function(comp) {
          comp.input.value = comp.value
        },
        placeholder: function(comp) {
          comp.input.setAttribute('placeholder', comp.placeholder)
          comp.input.id = sanitiseName(comp.placeholder)
          comp.label.setAttribute('for', sanitiseName(comp.placeholder))
          comp.label.innerText = comp.placeholder + (comp.hasAttribute('required')
            ? ''
            : ' (Optional)')
          comp.span.innerText = `The field '${comp.placeholder}' is required.`
        },
        check: function(comp) {
          if(comp.autocomplete){
            comp.input.setAttribute('autocomplete', comp.getAttribute('autocomplete'))
          }else{
            comp.input.setAttribute('autocomplete', 'new-password')
          }
        },
        replicates: function(comp) {
          comp.original = document.querySelector(`password-input[placeholder='${comp.getAttribute('replicates')}']`)
        }
      }
      if((oldValue !== newValue)){
        attributeHandler[name] && attributeHandler[name](this)
      }
    }

    safeSetAttribute(name, value) {
      if (this.getAttribute(name) !== value) {
        this.setAttribute(name, value)
      }
    }

    get placeholder(){
      return this.getAttribute('placeholder')
    }

    get value() {
      return this.getAttribute('value')
    }
    set value(value) {
      this.safeSetAttribute('value', value)
      this.ghost.value = value
    }

    get invalid() {
      return this.hasAttribute('invalid')
    }
    set invalid(value) {
      if (value) {
        this.safeSetAttribute('invalid', '')
      } else {
        this.removeAttribute('invalid')
      }
    }

    set strength(value) {
      this.safeSetAttribute('strength', value)
    }
  }
  window.customElements.define('password-input', PasswordInput)
})()