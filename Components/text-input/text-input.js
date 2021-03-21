(() => {
  const template = document.createElement('template')
  /*
   * Paths for CSS imports are a pain - this assumes that the css is in the same folder as the component
   * It'll allow us to use a File Watcher to transpile SCSS into CSS and include it in our component.
   * Reference: https://www.lifewire.com/difference-between-important-and-link-3466404
   */
  const compPath = document.currentScript.getAttribute('src').split('.').slice(0, -1).join('.')
  template.innerHTML = `
    <style>
      @import "${compPath}.css";
    </style>
    <div>
      <input type="text">
      <label></label>
      <span></span>
    </div>
  `
  /**
   * @customElement input-text
   *
   * @description This wraps a text input, a label and a span with a div element. The span acts as the
   * warning should there be an issue with the value
   *
   * @property value {string} the value contained within the text input, updated by input.
   *
   * @property placeholder {string} both the label and invisible placeholder and becomes
   * the "safe" `id` of the input and the value of the `for` of the label
   *
   * @property required {boolean} indicates whether an empty value is acceptable, or will trigger the
   * warning
   *
   * @property autocomplete {string}
   *
   * @example <caption>Ask a user for their first name</caption>
   * <input-text placeholder="First name"
   *             value="Dominic"
   *             required></input-text>
   */
  class InputText extends HTMLElement {
    static get observedAttributes() {
      return [
        'value',
        'placeholder',
        'invalid',
        'autocomplete'
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
          if (event.target.value && this.hasAttribute('required')) {
            this.invalid = false
            this.value = event.target.value
          }
        })
      }
    }
    /*
     * We want to have a safe name for the labels 'for' and the inputs 'id' attributes, we have the name, so it makes
     * sense to sanitise it for these attribute values. I "borrowed" a single line function from StackOverflow:
     * https://stackoverflow.com/questions/7627000/javascript-convert-string-to-safe-class-name-for-css#7627141
     */
    sanitiseName = value => value.replace(/[\s!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '').toLowerCase()
    lowercaseName = value => `${value[0].toLowerCase()}${value.slice(1)}`
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
        }
      }
      if((oldValue !== newValue) && attributeHandler.hasOwnProperty(name)){
        attributeHandler?.[name](this)
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
      if (!!value) {
        this.safeSetAttribute('invalid', '')
      } else {
        this.removeAttribute('invalid')
      }
    }
  }
  window.customElements.define('input-text', InputText)
})()