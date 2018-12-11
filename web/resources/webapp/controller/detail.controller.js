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

			this.getView().getBindingContext().delete("$auto").then(function () {
				//clearing fields
				that.getView().byId("empId").setText("");
				sap.ui.getCore().byId("appComponent---detail--gender").setText("");

				var successMessage = "Employee with ID " + EMPID + " is deleted";
				MessageBox.alert(successMessage, {
					title: "Alert", // default
					icon: "sap-icon://success",
					onClose: function () {
						var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter.navTo("Routemain", true);
						var empTable = sap.ui.getCore().byId("appComponent---main--emptable");
						var oBinding = empTable.getBinding("items");
						oBinding.refresh();
					}, // default
					styleClass: "", // default
					initialFocus: null, // default
					textDirection: sap.ui.core.TextDirection.Inherit // default
				});
			});

		},
		formatNumber: function (value) {
			return value.replace(/\,/g, "");
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
			var that = this;
			var dialog = this.getView().byId("editDialog");
			dialog.getModel().submitBatch("UserGroup").then(function () {
				var EMPID = that.getView().getBindingContext().getProperty("ID");
				var flag = dialog.getBindingContext().hasPendingChanges();
				if (!flag) {
					dialog.close();
					var message = "Employee " + EMPID + " is updated successfully";
					MessageBox.success(message);
				}
			});
		},
		close: function (oEvent) {
			
			var flag = this.getView().getBindingContext().hasPendingChanges();
			if (flag) {
				MessageBox.confirm("Do you want to update the pending changes?",
					jQuery.proxy(function (bResult) {
					
						if (bResult === "OK") {
							this.updateEmp();
						}else{
							this.getView().getModel().resetChanges("UserGroup");
						}
					}, this),
					"Warning");
			}
			var editDialog = (oEvent.getSource()).getEventingParent();
			editDialog.close();
					
		}

	});

});