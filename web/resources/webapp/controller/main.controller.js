sap.ui.define([
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterType"
], function (MessageToast, MessageBox, Fragment, Controller, FilterOperator, Sorter, Filter, FilterType) {

	return Controller.extend("com.sap.refapps.shine.web.controller.main", {
		onInit: function () {
			var oMessageManager = sap.ui.getCore().getMessageManager(),
				oMessageModel = oMessageManager.getMessageModel(),
				oMessageModelBinding = oMessageModel.bindList("/", undefined, [], new sap.ui.model.Filter("technical", FilterOperator.EQ, true)),
				oViewModel = new sap.ui.model.json.JSONModel({
					busy: false,
					hasUIChanges: false,
					usernameEmpty: true,
					order: 0
				});
			this.getView().setModel(oViewModel, "appView");
			this.getView().setModel(oMessageModel, "message");
			oMessageModelBinding.attachChange(this.onMessageBindingChange, this);
			this._bTechnicalErrors = false;
		},
		onCreate: function (oEvent) {
			var oView = this.getView();
			var dialog = this.getView().byId("createDialog");
			if (!dialog) {
				dialog = sap.ui.xmlfragment(oView.getId(),"com.sap.refapps.shine.web.view.create", this);
				this.getView().addDependent(dialog);
			}
			dialog.open();
			//clearing input data
			this.clearUIFields();
	
		},
		clearUIFields: function () {
			this.getView().byId("firstNameTextField").setValue("");
			this.getView().byId("lastNameTextField").setValue("");
			this.getView().byId("emailTextField").setValue("");
		},
		close: function (oEvent) {
			var oDialog = (oEvent.getSource()).getEventingParent();
			oDialog.close();
		},
		onSelection: function (oEvent) {
			var deleteButton = this.getView().byId("deleteButton");
			deleteButton.setEnabled(true);
		},
		onItemPress: function (oEvent) {
			//navigation
			var oItem = oEvent.getSource();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detail", {
				employeePath: encodeURIComponent(oItem.getBindingContext().getPath().substr(1))
			});
		},
		onLogoutPress: function (oEvent) {
			MessageBox.confirm("Do you sure want to logout?",
				jQuery.proxy(function (bResult) {
					if (bResult === "OK") {
						var url = window.location.href;
						var arr = url.split("/");
						var location = arr[0] + "//" + arr[2];
						window.location.replace(location+"/do/logout");
					}
				}, this),
				"Logout");
		},
		createEmp: function (oEvent) {
			//getting input data
			var firstname = this.getView().byId("firstNameTextField").getValue();
			var lastname = this.getView().byId("lastNameTextField").getValue();
			var email = this.getView().byId("emailTextField").getValue();
			var gender = this.getView().byId("genderRadioGroup").getSelectedIndex();
			var mobile = null;
			var today = new Date();
			var startdate = today;
			var enddate = null;
			var salary = null;
			var accountno = null;
			var bankid = null;
			var bankname = null;

			//creating payload
			var payload = {
				"firstname": firstname,
				"lastname": lastname,
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

			var that = this;
			
			var oTable =  this.getView().byId("emptable");
			var oModel = oTable.getModel();
		
			oModel.create("/Employee", payload, {
				success: function(data){
					//close the dialog
					var dialog = that.getView().byId("createDialog");
					dialog.close();
					var successMsg = "Employee "+data.ID+" is created";
					MessageBox.success(successMsg);
				}, 
				error: function(error){
					var errorMessage = JSON.parse(error.responseText).error.message.value;
					MessageBox.error(errorMessage);
				}
			});
			
		},
		onRefresh: function () {
			var empTable = this.getView().byId("emptable");
			empTable.setBusy(true);
			var oBinding = empTable.getBinding("items");
			oBinding.refresh();
			empTable.setBusy(false);
		},
		onRefreshPress: function () {
			this.onRefresh();
			MessageToast.show("Employee list refreshed");
		},

		onDelete: function () {
			var oSelected = this.getView().byId("emptable").getSelectedItem();
			var firstname = oSelected.getBindingContext().getProperty("firstname");
			var lastname = oSelected.getBindingContext().getProperty("lastname");
			MessageBox.confirm("Do you sure want to delete Employee: " + firstname +" "+lastname,
				jQuery.proxy(function (bResult) {
					if (bResult === "OK") {
						this.deleteEmp(oSelected);
					}
				}, this),
				"Delete Employee");
		},

		deleteEmp: function (oSelected) {
			if (oSelected) {
				var EMPID = oSelected.getBindingContext().getProperty("ID");
				var firstname = oSelected.getBindingContext().getProperty("firstname");
				var lastname = oSelected.getBindingContext().getProperty("lastname");
				var oTable = this.getView().byId("emptable");
				var oModel = oTable.getModel();
				oModel.remove("/Employee("+EMPID+")", {
					success: function(){
						oModel.refresh();
						var successMsg = "Employee "+firstname+" "+lastname+" is deleted";
						MessageBox.success(successMsg);
					}, 
					error: function(error){
						var errorMessage = JSON.parse(error.responseText).error.message.value;
						MessageBox.error(errorMessage);
					}
					
				});
			}
		},
		
		/**
		 * Sort the table according to the last name.
		 * Cycles between the three sorting states "none", "ascending" and "descending"
		 */
		onSort: function () {
			var oView = this.getView(),
				aStates = [undefined, "asc", "desc"],
				aStateTextIds = ["sortNone", "sortAscending", "sortDescending"],
				sMessage,
				iOrder = oView.getModel("appView").getProperty("/order");

			// // Cycle between the states
			iOrder = (iOrder + 1) % aStates.length;
			var sOrder = aStates[iOrder];

			oView.getModel("appView").setProperty("/order", iOrder);
			oView.byId("emptable").getBinding("items").sort(sOrder && new Sorter("ID", sOrder === "desc"));

			sMessage = this._getText("sortMessage", [this._getText(aStateTextIds[iOrder])]);
			MessageToast.show(sMessage);
		},
		
		/**
		 * Search for the firstname/lastname/email in the search field.
		 */
		onSearch: function () {
			var oView = this.getView(),
				sValue = oView.byId("searchField").getValue(),
				oFilter = new Filter({
					filters: [
						new Filter({
							path: "firstname",
							operator: FilterOperator.Contains,
							value1: sValue
						}),
						new Filter({
							path: "lastname",
							operator: FilterOperator.Contains,
							value1: sValue
						}),
						new Filter({
							path: "email",
							operator: FilterOperator.Contains,
							value1: sValue
						})
					]
				});

			oView.byId("emptable").getBinding("items").filter(oFilter, FilterType.Application);
		},
		
		/**
		 * Convenience method for retrieving a translatable text.
		 * @param {string} sTextId - the ID of the text to be retrieved.
		 * @param {Array} [aArgs] - optional array of texts for placeholders.
		 * @returns {string} the text belonging to the given ID.
		 */
		_getText: function (sTextId, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		}
	});
});
