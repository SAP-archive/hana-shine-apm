package com.sap.refapps.shine;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.UUID;
import com.sap.cloud.sdk.service.prov.api.*;
import com.sap.cloud.sdk.service.prov.api.annotations.*;
import com.sap.cloud.sdk.service.prov.api.exits.*;
import com.sap.cloud.sdk.service.prov.api.request.*;
import com.sap.cloud.sdk.service.prov.api.response.*;
import org.slf4j.*;
import java.util.List;
import com.sap.cloud.sdk.service.prov.rt.cds.CDSHandler;
import com.sap.cloud.sdk.hana.connectivity.cds.CDSException;
import com.sap.cloud.sdk.hana.connectivity.cds.CDSQuery;
import com.sap.cloud.sdk.hana.connectivity.cds.CDSSelectQueryBuilder;
import com.sap.cloud.sdk.service.prov.api.response.ErrorResponse;
import com.sap.cloud.sdk.service.prov.api.response.ErrorResponseBuilder;
import com.sap.cloud.sdk.service.prov.api.MessageContainer;
import java.util.regex.Matcher; 
import java.util.regex.Pattern;


public class EmployeeHandlers {
	
	private static final Logger logger = LoggerFactory.getLogger (EmployeeHandlers.class.getName()); 
	
	/**
	* Validate all mandatory fields
	*/
	public boolean validateMandatoryFields(EntityData data){
		if(data.contains("firstname")){
			if(data.getElementValue("firstname") == null){
				return false;
			}else{
				String firstname = data.getElementValue("firstname").toString();
				if(firstname.isEmpty()){
					return false;
				}
			}
			
		}
		if(data.contains("lastname")){
			if(data.getElementValue("lastname") == null){
				return false;
			}else{
				String lastname = data.getElementValue("lastname").toString();
				if(lastname.isEmpty()){
					return false;
				}
			}
		}
		if(data.contains("email")){
			if(data.getElementValue("email") == null){
				return false;
			}else{
				String email = data.getElementValue("email").toString();
				if(email.isEmpty()){
					return false;
				}
			}
		}
	
		return true;
	}
	
	/**
	* Validate all mandatory fields
	*/
	public boolean validateEmail(EntityData data){
		String email = data.getElementValue("email").toString();
		String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\."+ 
                            "[a-zA-Z0-9_+&*-]+)*@" + 
                            "(?:[a-zA-Z0-9-]+\\.)+[a-z" + 
                            "A-Z]{2,7}$"; 
        Pattern pat = Pattern.compile(emailRegex); 
        if (email == null) 
            return false; 
        return pat.matcher(email).matches(); 
	}
	
	/**
	* Validate Mobile Number
	*/
	public boolean validateMobileNo(EntityData data){
		if(data.contains("mobile")){
			if(data.getElementValue("mobile") != null){
				String mobile = data.getElementValue("mobile").toString();
				Pattern p = Pattern.compile("(0/91)?[7-9][0-9]{9}"); 
		        Matcher m = p.matcher(mobile); 
		        return (m.find() && m.group().equals(mobile)); 
			}
		}
		return true;
	}

	/**
	* check duplicate email
	*/
	public boolean isDuplicateEmail(EntityData data,ExtensionHelper eh){
		boolean flag = false;
		CDSHandler handler = (CDSHandler) eh.getHandler();
		CDSQuery cdsQuery = new CDSSelectQueryBuilder("Employee").build();
		try{
			List<EntityData> cdsdata = handler.executeQuery(cdsQuery).getResult();
			List<String> emails = cdsdata.stream().map(entity-> (entity.getElementValue("EMAIL").toString())).collect(Collectors.toList());
			String email = data.getElementValue("email").toString();
			for(String value : emails){
				if(value.equalsIgnoreCase(email)){
					flag = true;
				}
			}
		}catch (CDSException e) {
            logger.error("Error accessing the data", e);
        }
        return flag;
	}
	
	/**
	* Generate unique employee id
	*/
	public int generateEmployeeID(ExtensionHelper eh){
		int empUniqueID = 0; 
		int defaultEmpID = 1000;
		CDSHandler handler = (CDSHandler) eh.getHandler();
		CDSQuery cdsQuery = new CDSSelectQueryBuilder("Employee").build();
		try{
			List<EntityData> cdsdata = handler.executeQuery(cdsQuery).getResult();
			List<Integer> empIDs = cdsdata.stream().map(entity->Integer.parseInt(entity.getElementValue("ID").toString())).collect(Collectors.toList());
			Collections.sort(empIDs,Collections.reverseOrder());
            if(empIDs.isEmpty()){
            	empUniqueID = defaultEmpID;
            }else{
            	empUniqueID = empIDs.get(0)+1;
            }
		}catch (CDSException e) {
            logger.error("Error accessing the data", e);
        }
        return empUniqueID;
	}
	
	
	/**
	* Before Create: Validate the mandatory fields and email and generating unique employee id
	*/
	@BeforeCreate (entity = "Employee",  serviceName="EmployeeService")
	public BeforeCreateResponse beforeCreateEmployee(CreateRequest cr,ExtensionHelper eh) {
		EntityData data = cr.getData();
		
		//check for manadatory fields
		 if(!validateMandatoryFields(data)){
		 	return BeforeCreateResponse.setError(ErrorResponse.getBuilder().setMessage("Fill all mandatory fields").setStatusCode(400).response());
    	 }
    	 //check for valid email
    	 if(!validateEmail(data)){
    	 	return BeforeCreateResponse.setError(ErrorResponse.getBuilder().setMessage("Invalid email. Please fill a valid email").setStatusCode(400).response());
    	 }
		 
		 //check for duplicate email
		 if(isDuplicateEmail(data,eh)){
		 	return BeforeCreateResponse.setError(ErrorResponse.getBuilder().setMessage("Email is already taken").setStatusCode(409).response());
		 }
		
		// Generating the Employee ID
		int empId = generateEmployeeID(eh);
        EntityData edNew, edUpdated;
	    //remove dummy ID from the enity set
	    edNew = EntityData.getBuilder(data).removeElement("ID").buildEntityData("Employee");
	    //Update the entity set with the max ID 
	    edUpdated =  EntityData.getBuilder(edNew).addElement("ID", empId).buildEntityData("Employee");
	     
	    //return success response
	    return BeforeCreateResponse.setSuccess().setEntityData(edUpdated).response();
	}
	
	/**
	* Before Create: Validate the mandatory fields and email and mobile
	*/
	@BeforeUpdate (entity = "Employee",  serviceName="EmployeeService")
	public BeforeUpdateResponse beforeUpdateEmployee(UpdateRequest ur, ExtensionHelper eh){
		EntityData data = ur.getData();
		
		//check for manadatory fields
		 if(!validateMandatoryFields(data)){
		 	return BeforeUpdateResponse.setError(ErrorResponse.getBuilder().setMessage("Fill all mandatory fields").setStatusCode(400).response());
    	 }
		 //check for valid mobile no
		 if(!validateMobileNo(data)){
		 	return BeforeUpdateResponse.setError(ErrorResponse.getBuilder().setMessage("Invalid Mobile number").setStatusCode(400).response());
		 }
		 //return success response
	    return BeforeUpdateResponse.setSuccess().response();
	}
}
