$(document).ready(function () {
	const contactFormValidationRules = {
		name: {
			regex: /^[A-Z][a-z]+$/,
			message: 'Is Required and first letter must be uppercase and the rest lowercase'
		},
		email: {
			regex: /\S+@\S+\.\S+/,
			message: 'Is Required or in invalid format'
		},
		subject: {
			regex: /^[A-z\s]+$/,
			message: 'Is Required'
		},
		message: {
			regex: /^[A-z\s0-9\.]{10,300}$/,
			message: 'Is Required, no special characters except .(dot)'
		},
	};

	$('#main-contact-form').on('submit', function (e) {
		e.preventDefault();
		const errors = validateContactForm($(this).serializeArray().reduce((obj, f) => { obj[f.name] = f.value; return obj; }, {}));
		renderErrors($(this), errors);

		if ($.isEmptyObject(errors)) {
			$.toast({ text: 'Successfully submitted message, we will respond as soon as possible.', position: 'right-bottom' });
			$(this).get(0).reset();
		}
	});

	function validateContactForm(data) {
		const errors = {};
		$.each(data, (fieldName, fieldValue) => {
			if (contactFormValidationRules[fieldName]) {
				if (!contactFormValidationRules[fieldName].regex.test(fieldValue)) {
					errors[fieldName] = contactFormValidationRules[fieldName].message;
				}
			}
		});

		return errors;
	};

	function renderErrors(form, errors) {
		// clear existing errors
		$.each($(form).find('input, select, textarea'), function (i, element) {
			$(element).parent().removeClass('has-error');
			$(element).parent().find('.help-block').html('');
		});

		// render errors
		if (!$.isEmptyObject(errors)) {
			$.each(errors, function (fieldName, errorMessage) {
				$(form).find(`input[name=${fieldName}], textarea[name=${fieldName}]`).parent().addClass('has-error');
				$(form).find(`input[name=${fieldName}], textarea[name=${fieldName}]`).parent().find('.help-block').html(errorMessage);
			});
		}
	};
});