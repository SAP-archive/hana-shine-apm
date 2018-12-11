/*eslint-env node, es6*/
const cds = require('@sap/cds');

module.exports = function (entities) {

	const {Employee} = entities;
	const DEFAULT_EMPLOYEE_ID = 1000;
	/**
	 *	Validation of input fields
	 */
	const checkInputFields = ({
		data,
		error,
		reject
	}) => {
		//validate firstname
		if(!data.firstname.length > 0){
			reject(400, 'First Name should not be left blank.');
			return;
		}
		//validating if firstname contains digits
	/*	var re = /^[a-zA-Z]+$/;
		if(!re.test(data.firstname)){
			reject(400, 'First Name should not contain any number.');
			return;
		}*/
		//validate lastname
		if(!data.lastname.length > 0){
			reject(400, 'Last Name should not be left blank.');
			return;
		}
		//validating if lastname contains digits
	/*	var re = /^[a-zA-Z]+$/;
		if(!re.test(data.lastname)){
			reject(400, 'Last Name should not contain any number.');
			return;
		}*/
		//validate email
		if(!data.email.length > 0){
			reject(400, 'Email should not be left blank.');
			return;
		}
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if(!re.test(data.email)){
			reject(400, 'Invalid email provided.');
			return;
		}
		//validate gender
		if(data.gender === null){
			reject(400,'Gender should not be left blank');
			return;
		}
		//validate start date
		if(data.startdate === null){
			reject(400,"Validity start should not be left blank");
			return;
		}

	};

	/**
	 *	Generate unique Employee ID
	 */
	const generateEmployeeID = ({
		data,
		target,
		run,
		error
	}) => {
		return run(SELECT(['ID']).from(target))
			.then((result) => {
				if (result.length > 0) {
					var max;
					var arr = []
					for (var i = 0; i < result.length; i++) {
						arr.push(result[i]['ID'])
					}
					max = Math.max(...arr)
					var GENERATED_EMPLOYEE_ID = max + 1;
					data.ID = GENERATED_EMPLOYEE_ID;
				} else {
					//if emp table has no data ID starts with `DEFAULT_EMPLOYEE_ID`
					data.ID = DEFAULT_EMPLOYEE_ID;
				}
			})
	};

	/*
	 *	validation employee data
	 */
	const validateEmployee = (context) => {
		if (context.query.INSERT) {
			checkInputFields(context);
			generateEmployeeID(context);
		}
	};
	const checkEditedInputFields = ({data,reject}) => {
		//Manadatory fields validation
		//validate firstname
		if (data.firstname !== 'undefined' || data.firstname !== undefined) {
			//validating if firstname is null
			if (data.firstname === null) {
				reject(400, 'First Name should not be left blank.');
				return;
			}
		//	validating if firstname contains digits
			/*var re = /^[a-zA-Z]+$/;
			if(!re.test(data.firstname)){
				reject(400, 'First Name should not contain any number.');
				return;
			}*/
		}
		
		//validate lastname
		if (data.lastname !== 'undefined' || data.lastname !== undefined) {
			//validating if lastname is null
			if (data.lastname === null) {
				reject(400, 'Last Name should not be left blank.');
				return;
			}
			//validating if firstname contains digits
		/*	var re = /^[a-zA-Z]+$/;
			if(!re.test(data.lastname)){
				reject(400, 'Last Name should not contain any number.');
				return;
			}*/
		}
		//validate gender
		if(data.gender !== 'undefined' || data.gender !== undefined){
			if(data.gender === null){
				reject(400, 'Gender should not be left blank.');
				return;
			}
		}
		//validate email
		if(data.email !== undefined){
			if(data.email === null){
				reject(400, 'Email should not be left blank.');
				return;
			}
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(!re.test(data.email)){
				reject(400, 'Invalid email provided .');
				return;
			}
		}
		//validate startdate
		if(data.startdate !== 'undefined' || data.startdate !== undefined){
			if(data.startdate === null){
				reject(400,'Please enter a valid start date ');
				return;
			}
		}
		
		//Non-Manadatory field validation
		//validate mobile number
		if(data.mobile !== undefined){
			 var re = /^[0-9]+$/;
			if(!re.test(data.mobile) && data.mobile!== null){
			 	reject(400,'Invalid mobile number provided');
			 	return;
			 }
			 if(data.mobile !== null){
			 	if(data.mobile.length < 10 ){
					reject(400,'Please enter 10 digit mobile number');
					return;
			 	}
			 	if(data.mobile.length > 10 ){
					reject(400,'Please enter 10 digit mobile number');
					return;
			 	}
			 }
		}
		//validate account no
		if(data.accountno !== undefined){
			if(data.accountno !== null){
				if(data.accountno.length < 14){
					reject(400,'Please enter 14 digit account number.');
					return;
				}
				var re = /^[0-9]+$/;
				if(!re.test(data.accountno)){
					reject(400,'Please enter account number in digit');
					return;
				}
			}
		}
		
	};
	/*
	 *	 Before CREATE custom handlers
	 */
	this.before('CREATE', Employee, (context) => {
		return validateEmployee(context);
		// .then(() => {
		// 	 if (context._.errors && context._.errors.length){
		// 	 	return;
		// 	 } 
		// })
	});

	this.before('UPDATE', Employee, (context) => {
		return checkEditedInputFields(context);

	});
};