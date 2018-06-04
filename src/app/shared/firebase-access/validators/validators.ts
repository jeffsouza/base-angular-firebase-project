export class Validators {
  attributes: {} = {};
  private static minValue: number;
  private static maxValue: number;
  private static minLengthValue: number;
  private static maxLengthValue: number;

  static required() {
    return this.requiredValidator;
  }

  static requiredTrue() {
    return this.requiredTrueValidator;
  }

  static min(value) {
    Validators.minValue = value;
    return this.minValidator;
  }

  static max(value) {
    Validators.maxValue = value;
    return this.maxValidator;
  }

  static minLength(length) {
    Validators.minLengthValue = length;
    return this.minLengthValidator;
  }

  static maxLength(length) {
    Validators.maxLengthValue = length;
    return this.maxLengthValidator;
  }

  static email() {
    return this.emailValidator;
  }

  private static requiredValidator(value) {
    return value ? null : { requiredTrue: "O campo é obrigatório." };
  }

  private static requiredTrueValidator(value) {
    return value === true ? null : { required: "O campo deve ter o valor 'true'." };
  }

  private static minValidator(value) {
    return +value >= Validators.minValue ? null : { min: `O valor é menor que o mínimo permitido de ${Validators.minValue}.` }
  }

  private static maxValidator(value) {
    return +value <= Validators.maxValue ? null : { max: `O valor é maior que o máximo permitido de ${Validators.maxValue}.` }
  }

  private static minLengthValidator(value) {
    return value.length >= Validators.minLengthValue ? null : { minLength: `O campo deve ter no mínimo ${Validators.minLengthValue} caracteres.` }
  }

  private static maxLengthValidator(value) {
    return value.length <= Validators.maxLengthValue ? null : { maxLength: `O campo deve ter no máximo ${Validators.maxLengthValue} caracteres.` }
  }

  private static emailValidator(value) {
    let reg = /\S+@\S+\.\S+/;
    return reg.test(value) ? null : { email: `Não é um email válido.` }
  }

  validate(resource) {
    let errorsList = {errors: []};
    if (resource == null)
      return errorsList 

    for (let key in this.attributes) {
      let attributeName = key;
      let attributeErrors = {};

      this.attributes[key].forEach(validator => {
        let resultValidator = validator(resource[key]);
        if (resultValidator) {
          let resultValidatorKey = Object.keys(resultValidator)[0];
          let resultValidatorValue = resultValidator[resultValidatorKey];
          attributeErrors[attributeName] = attributeErrors[attributeName] ? attributeErrors[attributeName] : [];
          attributeErrors[attributeName].push({ [resultValidatorKey]: resultValidatorValue });
          errorsList['errors'].push(attributeErrors);
        }
      });

    }
    
    return errorsList;
  }

}