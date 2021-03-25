(() => {
  const template = document.createElement('template')
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

  const rootPath = thisPath.split('/').slice(0, -1).join('/')
  if(!document.querySelector(`script[src='${rootPath}/zxcvbn.js']`)){
    const script = document.createElement('script')
    script.setAttribute('src', `${rootPath}/zxcvbn.js`)
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('async', 'true')
    const firstScript = document.getElementsByTagName('script')[0]
    firstScript.parentNode.insertBefore(script, firstScript);
  }

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
        'invalid',
        'autocomplete',
        'check'
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
      this.lowercaseName = value => `${value[0].toLowerCase()}${value.slice(1)}`
      /*
       * We want to have a safe name for the labels 'for' and the inputs 'id' attributes, we have the name, so it makes
       * sense to sanitise it for these attribute values. I "borrowed" a single line function from StackOverflow:
       * https://stackoverflow.com/questions/7627000/javascript-convert-string-to-safe-class-name-for-css#7627141
       */
      this.sanitiseName = value => value.replace(/[\s!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '').toLowerCase()
    }
    connectedCallback() {
      if (this.input.isConnected) {
        this.input.addEventListener('blur', event => {
          if (!event.target.value && this.hasAttribute('required')) {
            this.invalid = true
          } else {
            this.invalid = false
            this.value = event.target.value
          }
        })
        this.input.addEventListener('input', event => {
          this.value = event.target.value
          if(this.hasAttribute('check')) {
            const result = zxcvbn(event.target.value)
            this.strength = result.score
          }else{
            if (event.target.value && this.hasAttribute('required')) {
              this.invalid = false
              this.value = event.target.value
            }
          }
        })
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
          comp.input.id = comp.sanitiseName(comp.placeholder)
          comp.label.setAttribute('for', comp.sanitiseName(comp.placeholder))
          comp.label.innerText = comp.placeholder + (comp.hasAttribute('required')
            ? ''
            : ' (Optional)')
          comp.span.innerText = `The ${comp.lowercaseName(comp.placeholder)} field is required.`
        },
        check: function(comp) {
          if(comp.autocomplete){
            comp.input.setAttribute('autocomplete', comp.getAttribute('autocomplete'))
          }else{
            comp.input.setAttribute('autocomplete', 'new-password')
          }
        }
      }
      if((oldValue !== newValue)){
        attributeHandler[name] && attributeHandler[name](this)
      }
    }
    /**
     * Guards against loops when reflecting observed attributes.
     * @param  {String} name Attribute name
     * @param  {any} value
     * @protected
     */
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
      if (value) {
        this.safeSetAttribute('strength', value)
      } else {
        this.removeAttribute('strength')
      }
    }
  }
  window.customElements.define('password-input', PasswordInput)
})()