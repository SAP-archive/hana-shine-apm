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
			var today = this.formatDate(new Date());
			var startdate = today;
			var enddate = null;
			var salary = null;
			var accountno = null;
			var bankid = null;
			var bankname = null;

			//creating payload
			var data = {
				"ID": 9999, //default ID
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
			var oList = this.getView().byId("emptable");

			var oContext = oList.getBinding("items").create(data);
			// trigger batch request
			this.getView().getModel().submitBatch("UserGroup");
			oContext.created().then(function () {
				var dialog = that.getView().byId("createDialog");
				dialog.close();
				MessageBox.success("Employee created: " + oContext.getProperty("ID"));
				that.onRefresh();
			});
			// Select and focus the table row that contains the newly created entry
			oList.getItems().some(function (oItem) {
				if (oItem.getBindingContext() === oContext) {
					oItem.focus();
					oItem.setSelected(true);
					return true;
				}
			});
		},

		onMessageBindingChange: function (oEvent) {
			var that = this;
			var aContexts = oEvent.getSource().getContexts(),
				aMessages, bMessageOpen = false;
			if (bMessageOpen || !aContexts.length) {
				return;
			}
			// Extract and remove the technical messages
			aMessages = aContexts.map(function (oContext) {
				return oContext.getObject();
			});
			sap.ui.getCore().getMessageManager().removeMessages(aMessages);
			//this._setUIChanges(true);
			this._bTechnicalErrors = true;
			sap.m.MessageBox.error(aMessages[0].message, {
				onClose: function () {
					var view = that.getView()+"";
					var viewName = view.split("#")[1];
					var oSelected = sap.ui.getCore().byId(viewName+"--emptable").getSelectedItem();
					if(oSelected === null){
						oSelected = sap.ui.getCore().byId("appComponent---main--emptable").getSelectedItem();
					}
					// var oSelected = empTable.getSelectedItem();
					oSelected.getBindingContext().delete("$auto");
					bMessageOpen = false;
				}
			});
			
			bMessageOpen = true;
			return;
		},
		onRefresh: function () {
			var empTable = this.getView().byId("emptable");
			empTable.setBusy(true);
			var oBinding = empTable.getBinding("items");
			oBinding.refresh();
			empTable.setBusy(false);
		},
		onRefreshPress: function (oEvent) {
			this.onRefresh();
			MessageToast.show("Employee list refreshed");
		},

		onDelete: function (oEvent) {
			var oSelected = this.getView().byId("emptable").getSelectedItem();
			var EMPID = oSelected.getBindingContext().getProperty("ID");
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
				var that = this;
				var EMPID = oSelected.getBindingContext().getProperty("ID");
				var firstname = oSelected.getBindingContext().getProperty("firstname");
				var lastname = oSelected.getBindingContext().getProperty("lastname");
				oSelected.getBindingContext().delete("$auto").then(function () {
					var successMessage = "Employee " + firstname +" "+lastname+" is deleted";
					MessageBox.show(successMessage, "SUCCESS", "Success");
					var deleteButton = that.getView().byId("deleteButton");
				}, function (oError) {
					MessageBox.error(oError.message);
				});
			}
		},
		formatDate: function (date) {
			var d = new Date(date),
				month = "" + (d.getMonth() + 1),
				day = "" + d.getDate(),
				year = d.getFullYear();

			if (month.length < 2) {
				month = "0" + month;
			}
			if (day.length < 2) {
				day = "0" + day;
			}

			return [year, month, day].join("-");
		},

		formatNumber: function (value) {
			return value.replace(/\,/g, "");
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
