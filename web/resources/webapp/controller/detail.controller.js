sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, MessageToast, MessageBox, Fragment) {
	"use strict";
	return Controller.extend("com.sap.refapps.shine.web.controller.detail", {
		onBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Routemain", true);
		},
		onAfterRendering: function () {
			var tabBar = this.getView().byId("empIconTabBar");
			tabBar.setSelectedKey("personal");
		},
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("detail").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			var tabBar = this.getView().byId("empIconTabBar");
			tabBar.setSelectedKey("personal");
			this.getView().bindElement({
				path: "/" + oEvent.getParameter("arguments").employeePath,
				parameters: {
					$$updateGroupId: "UserGroup"
				}
			});
		},
		onDelete: function (oEvent) {
			var EMPID = this.getView().getBindingContext().getProperty("ID");
			MessageBox.confirm("Do you sure want to delete Employee ID: " + EMPID,
				jQuery.proxy(function (bResult) {
					if (bResult === "OK") {
						this.deleteEmp(EMPID);
					}
				}, this),
				"Delete Employee");
		},

		deleteEmp: function (EMPID) {
			var that = this;
			var oModel = this.getView().getModel();
			oModel.remove("/Employee("+EMPID+")", {
				success: function(){
					oModel.refresh();
					var successMsg = "Employee with ID "+EMPID+" is deleted";
					MessageBox.success(successMsg);
					
					var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
					oRouter.navTo("Routemain", true);
					oModel.refresh();
				}, 
				error: function(error){
					var errorMessage = JSON.parse(error.responseText).error.message.value;
					MessageBox.error(errorMessage);
				}
				
			});

		},
		inputChange: function (oEvent) {
			this.getView().byId("eupdate").setEnabled(true);
		},
		onEdit: function (oEvent) {
			var oView = this.getView();
			var dialog = this.getView().byId("editDialog");
			if (!dialog) {
				dialog = sap.ui.xmlfragment(oView.getId(), "com.sap.refapps.shine.web.view.edit", this);
				this.getView().addDependent(dialog);
			}
			dialog.open();
			oView.byId("eupdate").setEnabled(false);
			var ID = oView.getBindingContext().getProperty("ID");
			oView.bindElement({
				path: "/Employee(" + ID + ")",
				parameters: {
					$$updateGroupId: "UserGroup"
				}
			});
		},
		updateEmp: function () {
			var dialog = this.getView().byId("editDialog");
			var oModel = this.getView().getModel();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyy-MM-dd" });
			
			var EMPID = this.getView().getBindingContext().getProperty("ID");
			//startdate formatting
			var startdateVal = this.getView().byId("estartdateField").getValue();
			var startdate;
			if(startdateVal === ""){
				startdate = null;
			}else{
				startdate = new Date(startdateVal);
				startdate = new Date(dateFormat.format(startdate));
			}
			//enddate formatting
			var enddateVal = this.getView().byId("eenddateField").getValue();
			var enddate;
			if(enddateVal === ""){
				enddate = null;
			}else{
				enddate = new Date(enddateVal);
				enddate = new Date(dateFormat.format(enddate));
			}
			
			var firstname = this.getView().byId("efirstNameTextField").getValue();
			if(firstname === ""){
				firstname = null;
			}

			var lastname =  this.getView().byId("elastNameTextField").getValue();
			if(lastname === ""){
				lastname = null;
			}

			var email = this.getView().byId("eemailTextField").getValue();
			if(email === ""){
				email = null;
			}

			var gender = this.getView().byId("egenderRadioGroup").getSelectedIndex();
				
			var mobile = this.getView().byId("emobileTextField").getValue();
			if(mobile === ""){
				mobile = null;
			}
			var salary = this.getView().byId("esalaryField").getValue();
			if(salary === ""){
				salary = null;
			}
			var accountno = this.getView().byId("eaccountnoField").getValue();
			if(accountno === ""){
				accountno = null;
			}
			var bankid =  this.getView().byId("ebankidField").getValue();
			if(bankid === ""){
				bankid = null;
			}
			var bankname = this.getView().byId("ebanknameField").getValue();
			if(bankname === ""){
				bankname = null;
			}
			
			var payload = {
				"firstname": firstname,
				"lastname":  lastname,
				"email": email,
				"gender": gender,
				"mobile": mobile,
				"startdate": startdate,
				"enddate": enddate,
				"salary": salary,
				"accountno": accountno,
				"bankid": bankid,
				"bankname": bankname
			};
			oModel.update("/Employee("+EMPID+")", payload, {
				success: function(){
					dialog.close();
					var successMessage = "Employee"+EMPID+" is updated";
					MessageBox.success(successMessage);
				
				}, 
				error: function(error){
					var errorMessage = JSON.parse(error.responseText).error.message.value;
					MessageBox.error(errorMessage);
				}
				
			});
		},
		close: function (oEvent) {
			var editDialog = (oEvent.getSource()).getEventingParent();
			editDialog.close();
					
		},
		formatDate: function(str){
			var date,mnth,day;
			var res = null;
			if(str !== null){
				date = new Date(str);
		        mnth = ("0" + (date.getMonth()+1)).slice(-2);
		        day  = ("0" + date.getDate()).slice(-2);
		    	res = [ date.getFullYear(), mnth, day ].join("-");
			}
			return res;
		}

	});

});