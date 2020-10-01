import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase("db.db");

export default class DataBase{

	constructor(){
		db.transaction(tx => {
	      tx.executeSql(
	        "create table if not exists scenario (id integer primary key not null, name text, year int,month text,description text,yn integer,age text);"
	      );
	      
	      tx.executeSql(
	  	        "create table  if not exists version (id integer primary key not null, version integer);"
	  	   );

	    });
	}
	
	getVersion(callback){
		console.log("getVersion")
		 db.transaction(tx => {
			 console.log("tx")
			 tx.executeSql("select version from version", [], (_, { rows }) => {
	          callback(rows)
			 },(err)=>console.log("err - "+err)
			 );
	    });
	}
	
	insertScenarios(scenarios){
		const self = this;
		this.deleteScenarios();
		scenarios.forEach((scenario)=>{
			self.insertScenario(scenario)
		})
	}
	
	deleteScenarios(){
		db.transaction(tx => {
	      tx.executeSql(
	        "delete from scenario"
	      );
	    });
	}
	
	insertScenario(scenario){
		 db.transaction(tx => {
	      tx.executeSql(
	        "insert into scenario (id,name,year,month,description,yn,age) values (?,?,?,?,?,?,?)",
	        [scenario.id,scenario.name,scenario.year,scenario.month,scenario.description,scenario.yn,scenario.age]
	      );
	    });
	}
	
	getScenarios(callback){
		 db.transaction(tx => {
			 tx.executeSql("select * from scenario", [], (_, { rows }) => {
				// console.log("rows - "+rows)
	          callback(rows)
			 },(err)=>console.log("err - "+err)
			 );
	    });
	}
}