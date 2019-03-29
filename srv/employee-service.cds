using {com.sap.refapps.shine} from '../db/data-model';

service EmployeeService {
	entity Employee as projection on shine.Employee;
}
