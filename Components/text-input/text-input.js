(() => {
  const template = document.createElement('template')
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
  /*
   * We want to have a safe name for the labels 'for' and the inputs 'id' attributes, we have the name, so it makes
   * sense to sanitise it for these attribute values. I "borrowed" a single line function from StackOverflow:
   * https://stackoverflow.com/questions/7627000/javascript-convert-string-to-safe-class-name-for-css#7627141
   */
  const sanitiseName = value => value.replace(/[\s!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '').toLowerCase()
  const randomString = length => [...Array(length)].map(() => Math.random().toString(36)[2]).join('')

  class Observable {
    constructor(value) {
      this._listeners = [];
      this._value = value;
    }
    notify() {
      this._listeners.forEach(listener => listener(this._value));
    }
    subscribe(listener) {
      this._listeners.push(listener);
    }
    get value() {
      return this._value;
    }
    set value(val) {
      if (val !== this._value) {
        this._value = val;
        this.notify();
      }
    }
  }

  class Computed extends Observable {
    constructor(value, deps) {
      super(value());
      const listener = () => {
        this._value = value();
        this.notify();
      }
      deps.forEach(dep => dep.subscribe(listener));
    }

    get value() {
      return this._value;
    }

    set value(_) {
      throw "Cannot set computed property";
    }
  }

  /**
   * @customElement input-text
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
  class TextInput extends HTMLElement {
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
        this.input.addEventListener('blur', this.blurListener)
        this.input.addEventListener('input', this.inputListener)
        if(this.hasAttribute('name')){
          this.ghost_id = `ghost_input_${randomString(8)}`
          const ghost = this.createGhost(this.ghost_id)
          this.appendChild(ghost)
          this.ghost = document.getElementById(this.ghost_id)
          const first = new Observable("Jeremy");
          const firstInp = document.getElementById("first");
          this.bindValue(this.input, this.ghost);
        }
      }
    }

    createGhost(id) {
      const input = document.createElement('input')
      input.setAttribute('id', id)
      input.setAttribute('name', this.getAttribute('name'))
      input.setAttribute('tabindex', -1)
      input.style.width = '0'
      input.style.height = '0'
      input.style.border = 'none'
      return input
    }

    bindValue = (input, observable) => {
      input.value = observable.value;
      observable.subscribe(() => input.value = observable.value);
      input.onkeyup = () => observable.value = input.value;
    }

    detachedCallback() {
      this.input.removeEventListener('blur', this.blurListener)
      this.input.removeEventListener('input', this.inputListener)
    }

    blurListener = (event) => {
      if (!event.target.value && this.hasAttribute('required')) {
        this.invalid = true
      } else {
        this.invalid = false
        this.value = event.target.value
      }
    }

    inputListener = (event) => {
      this.value = event.target.value
      if (event.target.value && this.hasAttribute('required')) {
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
        name: function(comp){
          const ghost = document.querySelector(`#${this.hiddenId}`)
          ghost.value = comp.getAttribute('value')
          ghost.addEventListener('change', comp.ghostListener)
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
      //this.ghost.value = value
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
  window.customElements.define('text-input', TextInput)
})()