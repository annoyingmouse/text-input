(() => {
  const template = document.createElement('template')
  template.innerHTML = `
    <style>
:host {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, cursive;
  --Gray50: #7f7f7f;
  --Gray75: #bfbfbf;
  --Gray90: #e5e5e5;
  --white: #ffffff;
  --TorchRed: #ff0033;
  --VeryPaleRed: #eba19e;
  --rem-twentieth: 0.05rem;
  --rem-eighth: 0.125rem;
  --rem-quarter: 0.25rem;
  --rem-half: 0.5rem;
  --rem-six-tenths: 0.6rem;
  --rem-seven-tenths: 0.7rem;
  --rem-three-quarters: 0.75rem;
  --rem-eigth-tenths: 0.8rem;
  --rem: 1rem;
  --rem-and-a-half: 1.5rem;
  --rem-and-three-quarters: 1.75rem;
  --rem-three: 3rem;
  --s-fifth: 0.2s;
  --op-nine-tenths: 0.9;
  --op-sixth-tenths: 0.6;
  --input-text-size: var(--rem-and-a-half);
  --input-padding: var(--rem-eigth-tenths);
  --input-border: var(--rem-twentieth);
  --input-height: calc(var(--input-text-size) + calc(var(--input-border) + calc(var(--input-padding) * 2)));
}

:host([invalid]) label {
  color: var(--TorchRed);
  opacity: 1;
}
:host([invalid]) input {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-color: var(--TorchRed);
}

div {
  position: relative;
  margin-top: var(--rem);
  margin-bottom: var(--rem-and-a-half);
}

input {
  box-sizing: border-box;
  border: var(--input-border) solid var(--Gray90);
  border-radius: var(--rem-eighth);
  width: 100%;
  transition: border var(--s-fifth) linear, background-color var(--s-fifth) linear;
  display: inline-block;
  padding: var(--input-padding);
  line-height: var(--input-text-size);
  margin-bottom: var(--rem-three-quarters);
}
input:focus + label, input:not(:placeholder-shown) + label {
  top: calc(var(--rem-six-tenths) * -1);
  left: var(--rem-eighth);
  background-color: var(--white);
  font-size: var(--rem-eigth-tenths);
  padding: 0 var(--rem) 0 var(--rem-half);
  border-radius: var(--rem);
}
input:focus {
  outline: none;
  box-shadow: 0 0 var(--rem-eighth) var(--rem-twentieth) rgba(0, 0, 0, 0.1);
  border-color: var(--Gray75);
}
input:hover {
  border-color: var(--Gray75);
}
input::-webkit-input-placeholder {
  color: transparent;
}
input::-moz-placeholder {
  color: transparent;
}
input:-ms-input-placeholder {
  color: transparent;
}
input:-moz-placeholder {
  color: transparent;
}
input::placeholder {
  color: transparent;
}

label {
  position: absolute;
  top: var(--rem-three-quarters);
  left: var(--rem);
  color: var(--Gray50);
  transition: all var(--s-fifth) ease-in;
  pointer-events: none;
}
label:hover {
  cursor: auto;
}

span {
  position: absolute;
  left: 0;
  right: 0;
  top: var(--input-height);
  opacity: 1;
  pointer-events: none;
  background-color: var(--TorchRed);
  color: var(--white);
  border: var(--VeryPaleRed);
  padding: 0 var(--rem-quarter) var(--rem-eighth) var(--rem-quarter);
}
span.hidden {
  display: none;
  border: none;
}

/*# sourceMappingURL=text-input.css.map */

    </style>
    <div>
      <input type="text">
      <label></label>
      <span class="hidden"></span>
    </div>
  `
  /**
   * @customelement input-element
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
      this.name = null
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
    // https://stackoverflow.com/questions/7627000/javascript-convert-string-to-safe-class-name-for-css#7627141
    sanitiseName = value => value.replace(/[\s!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '').toLowerCase()
    lowercaseName = value => `${value[0].toLowerCase()}${value.slice(1)}`
    attributeChangedCallback(name, oldValue, newValue) {
      const attributeHandler = {
        autocomplete: function() {
          this.input.setAttribute('autocomplete', this.getAttribute('autocomplete'))
        }.bind(this),
        value: function() {
          this.input.value = this.value
        }.bind(this),
        placeholder: function() {
          this.input.setAttribute('placeholder', this.placeholder)
          this.input.id = this.sanitiseName(this.placeholder)
          this.label.setAttribute('for', this.sanitiseName(this.placeholder))
          this.label.innerText = this.placeholder + (this.hasAttribute('required')
              ? '' : ' (Optional)')
          this.span.innerText = `The ${this.lowercaseName(this.placeholder)} field is required.`
          this.name = this.placeholder
        }.bind(this),
        invalid: function() {
          this.handleInvalidState(newValue)
        }.bind(this)
      }
      oldValue !== newValue && attributeHandler?.[name]()
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
    handleInvalidState(value) {
      if (value !== null) {
        this.span.classList.remove('hidden')
      } else {
        this.span.classList.add('hidden')
      }
    }
  }
  window.customElements.define('input-text', InputText)
})()