(() => {
<<<<<<< HEAD
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
=======
  const template = document.createElement('template')
  const thisPath = document.currentScript.getAttribute('src')
  const compPath = thisPath.split('.').slice(0, -1).join('.')
>>>>>>> 96249dc92a165d7c4549a377be569d3d6b596abc
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
<<<<<<< HEAD
  /**
   * @customElement input-password
=======

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
>>>>>>> 96249dc92a165d7c4549a377be569d3d6b596abc
   *
   * @description This wraps a text input, a label and a span with a div element. The span acts as the warning should
   * there be an issue with the value
   *
<<<<<<< HEAD
   * @property value {string} the value contained within the text input, updated by input. Unlikely to be set in the
   * HTML
=======
   * @property value {string} the value contained within the text input, updated by input.
>>>>>>> 96249dc92a165d7c4549a377be569d3d6b596abc
   *
   * @property placeholder {string} both the label and invisible placeholder and becomes the "safe" `id` of the input
   * and the value of the `for` of the label
   *
   * @property required {boolean} indicates whether an empty value is acceptable, or will trigger the warning. I think
   * this counts as a Boolean but in reality - if it the attribute exists then validation will occur.
   *
<<<<<<< HEAD
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
=======
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
>>>>>>> 96249dc92a165d7c4549a377be569d3d6b596abc
    }
    constructor() {
      super()
      this.shadow = this.attachShadow({
<<<<<<< HEAD
          mode: 'closed'
=======
        mode: 'closed'
>>>>>>> 96249dc92a165d7c4549a377be569d3d6b596abc
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
<<<<<<< HEAD
          if (event.target.value && this.hasAttribute('required')) {
            this.invalid = false
            this.value = event.target.value
=======
          if(this.hasAttribute('check')) {
            const result = zxcvbn(event.target.value)
            this.strength = result.score
          }else{
            if (event.target.value && this.hasAttribute('required')) {
              this.invalid = false
              this.value = event.target.value
            }
>>>>>>> 96249dc92a165d7c4549a377be569d3d6b596abc
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
<<<<<<< HEAD
          comp.input.safeSetAttribute('placeholder', comp.placeholder)
          comp.input.id = comp.sanitiseName(comp.placeholder)
          comp.label.safeSetAttribute('for', comp.sanitiseName(comp.placeholder))
=======
          comp.input.setAttribute('placeholder', comp.placeholder)
          comp.input.id = comp.sanitiseName(comp.placeholder)
          comp.label.setAttribute('for', comp.sanitiseName(comp.placeholder))
>>>>>>> 96249dc92a165d7c4549a377be569d3d6b596abc
          comp.label.innerText = comp.placeholder + (comp.hasAttribute('required')
            ? ''
            : ' (Optional)')
          comp.span.innerText = `The ${comp.lowercaseName(comp.placeholder)} field is required.`
        },
        check: function(comp) {
<<<<<<< HEAD
          if(this.autocomplete){
            comp.input.safeSetAttribute('autocomplete', comp.getAttribute('autocomplete'))
          }else{
            comp.input.safeSetAttribute('autocomplete', 'new-password')
=======
          if(comp.autocomplete){
            comp.input.setAttribute('autocomplete', comp.getAttribute('autocomplete'))
          }else{
            comp.input.setAttribute('autocomplete', 'new-password')
>>>>>>> 96249dc92a165d7c4549a377be569d3d6b596abc
          }
        }
      }
      if((oldValue !== newValue)){
        attributeHandler[name] && attributeHandler[name](this)
      }
    }
<<<<<<< HEAD
=======
    /**
     * Guards against loops when reflecting observed attributes.
     * @param  {String} name Attribute name
     * @param  {any} value
     * @protected
     */
>>>>>>> 96249dc92a165d7c4549a377be569d3d6b596abc
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
<<<<<<< HEAD
    get autocomplete() {
      return this.getAttribute('check')
    }
=======
>>>>>>> 96249dc92a165d7c4549a377be569d3d6b596abc
    get invalid() {
      return this.hasAttribute('invalid')
    }
    set invalid(value) {
      if (value) {
        this.safeSetAttribute('invalid', '')
      } else {
        this.removeAttribute('invalid')
      }
<<<<<<< HEAD
    }
  }
  window.customElements.define('input-password', InputPassword)
=======
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
>>>>>>> 96249dc92a165d7c4549a377be569d3d6b596abc
})()