(() => {
  // const thisScript = document.currentScript;
  // console.log('hi',thisScript)
  //
  //
  // var ZXCVBN_SRC = 'zxcvbn.js';
  //
  // var async_load = function() {
  //   var first, s;
  //   s = document.createElement('script');
  //   s.src = ZXCVBN_SRC;
  //   s.type = 'text/javascript';
  //   s.async = true;
  //   first = document.getElementsByTagName('script')[0];
  //   return first.parentNode.insertBefore(s, first);
  // };
  //
  // if (window.attachEvent != null) {
  //   window.attachEvent('onload', async_load);
  // } else {
  //   window.addEventListener('load', async_load, false);
  // }



  const template = document.createElement('template')
  const compPath = document.currentScript.getAttribute('src').split('.').slice(0, -1).join('.')
  console.log(compPath)
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
  /**
   * @customElement input-password
   *
   * @description This wraps a text input, a label and a span with a div element. The span acts as the warning should
   * there be an issue with the value
   *
   * @property value {string} the value contained within the text input, updated by input. Unlikely to be set in the
   * HTML
   *
   * @property placeholder {string} both the label and invisible placeholder and becomes the "safe" `id` of the input
   * and the value of the `for` of the label
   *
   * @property required {boolean} indicates whether an empty value is acceptable, or will trigger the warning. I think
   * this counts as a Boolean but in reality - if it the attribute exists then validation will occur.
   *
   * @property check {boolean} indicates whether or not to check the password for complexity using
   *
   * @property autocomplete {string} this will only work if the input is within a form which has a submit button. If
   * this isn't set then it defaults to `current-password` unless `check` is present, if check is present it will
   * instead be `new-password`
   *
   * @example <caption>Ask a user for a new password</caption>
   *
   * <input-password placeholder="Enter a password"
   *                 check></input-password>
   */
  class InputPassword extends HTMLElement {
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
          if (event.target.value && this.hasAttribute('required')) {
            this.invalid = false
            this.value = event.target.value
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
          comp.input.safeSetAttribute('placeholder', comp.placeholder)
          comp.input.id = comp.sanitiseName(comp.placeholder)
          comp.label.safeSetAttribute('for', comp.sanitiseName(comp.placeholder))
          comp.label.innerText = comp.placeholder + (comp.hasAttribute('required')
            ? ''
            : ' (Optional)')
          comp.span.innerText = `The ${comp.lowercaseName(comp.placeholder)} field is required.`
        },
        check: function(comp) {
          if(this.autocomplete){
            comp.input.safeSetAttribute('autocomplete', comp.getAttribute('autocomplete'))
          }else{
            comp.input.safeSetAttribute('autocomplete', 'new-password')
          }
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
    }
    get autocomplete() {
      return this.getAttribute('check')
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
  window.customElements.define('input-password', InputPassword)
})()