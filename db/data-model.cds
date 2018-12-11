namespace com.sap.refapps.shine;

entity Employee {
  key ID : Integer;
  firstname: String;
  lastname: String;
  email: String;
  gender: Integer;
  mobile: String(12);
  startdate: Date;
  enddate: Date;
  salary: Double;
  accountno: String;
  bankid: String;
  bankname: String;
}