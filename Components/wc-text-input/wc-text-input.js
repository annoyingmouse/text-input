(() => {
  const template = document.createElement('template')
  const ghost_template = document.createElement('template')
  /*
   * Paths for CSS imports are a pain - this assumes that the css is in the same folder as the component
   * It'll allow us to use a File Watcher to transpile SCSS into CSS and include it in our component.
   * Reference: https://www.lifewire.com/difference-between-important-and-link-3466404
   * NOTE: This does mean that both the component script and the CSS should reside in the same folder and
   * should have the same name!
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
  const sanitiseName = value => value.replace(/[\s!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '').toLowerCase()

  class WCTextInput extends HTMLElement {
    #label
    #input
    #span
    #disabled

    static formAssociated = true

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
        mode: 'open',
        delegatesFocus: true
      })
      this.shadow.appendChild(template.content.cloneNode(true))
      this.#label = this.shadow.querySelector('label')
      this.#input = this.shadow.querySelector('input')
      this.#span = this.shadow.querySelector('span')
      this.#disabled = false
      this.internals = this.attachInternals()
    }

    connectedCallback() {
      if (this.#input.isConnected) {
        this.name = this.getAttribute('name')
        this.#input.addEventListener('blur', this.blurListener)
        this.#input.addEventListener('input', this.inputListener)
        if(this.hasAttribute('required') && this.value === ''){
           this.internals.setValidity(
             {
               badInput: true
             },
             null,
             this.#input
           )
         }else{
           this.internals.setValidity({})
         }
      }
    }

    detachedCallback() {
      this.#input.removeEventListener('blur', this.blurListener)
      this.#input.removeEventListener('input', this.inputListener)
    }

    blurListener = event => {
      if (!event.target.value && this.hasAttribute('required')) {
        this.invalid = true
      } else {
        this.invalid = false
        this.value = event.target.value
      }
    }

    inputListener = event => {
      this.value = event.target.value
      if (event.target.value && this.hasAttribute('required')) {
        this.invalid = false
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      const attributeHandler = {
        autocomplete: function(comp) {
          comp.#input.setAttribute('autocomplete', comp.getAttribute('autocomplete'))
        },
        value: function(comp) {
          comp.#input.value = comp.value
          comp.setValue(comp.value)
        },
        placeholder: function(comp) {
          comp.#input.setAttribute('placeholder', comp.placeholder)
          comp.#input.id = sanitiseName(comp.placeholder)
          comp.#label.setAttribute('for', sanitiseName(comp.placeholder))
          comp.#label.innerText = comp.placeholder + (comp.hasAttribute('required')
            ? ''
            : ' (Optional)')
          comp.#span.innerText = `The field '${comp.placeholder}' is required.`
        }
      }
      if((oldValue !== newValue)){
        attributeHandler[name] && attributeHandler[name](this)
      }
    }

    setValue(value) {
      this.internals.setFormValue(value);
    }

    safeSetAttribute(name, value) {
      if (this.getAttribute(name) !== value) {
        this.setAttribute(name, value)
      }
    }

    formDisabledCallback(disabled) {
      if (disabled) {
        this.value = ''
        this.#disabled = true
        this.#input.setAttribute('disabled', 'disabled')
      }else{
        this.#disabled = false
        this.#input.removeAttribute('disabled')
      }
    }

    reportValidity() { // expose reportValidity on the CE's surface
      console.log("reporting")
      return this.internals.reportValidity();
    }

    formResetCallback() {
      this.value = ''
    }

    get placeholder(){
      return this.getAttribute('placeholder')
    }

    get value() {
      return this.getAttribute('value')
    }
    set value(value) {
      this.reportValidity()
      this.safeSetAttribute('value', value)
      this.setValue(value)

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
  }
  window.customElements.define('wc-text-input', WCTextInput)
})()