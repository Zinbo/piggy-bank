/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

	todaysValue: 0,
	weeksValue: 0,
	monthsValue: 0,
	yearsValue: 0,
	
	todaysPurchases: [],
	weeksPurchases: [],
	monthsPurchases: [],
	yearsPurchases: [],
	
	items: [],

    // Application Constructor
    initialize: function() {
        this.bindEvents();

    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
	
	addValueToScreen: function(itemName) {
		var valueFromDb = window.localStorage.getItem(itemName);
		if(valueFromDb != 'undefined'){
			$("#" + itemName).text("£"+valueFromDb);
		}
	},
	
	populateTable: function(purchasedItems, tableName) {
		$("#yourtableid tr").remove();
		purchasedItems.forEach(function(item) {
			$('#' + tableName + ' tr:last').after('<tr> <td>' + item.name + '</td> <td>' + item.value + '</td> </tr>');
		});
	},
	
	initialiseValues: function() {
		var foundItems = window.localStorage.getItem("items");
		if(foundItems == 'undefined' || foundItems == null || foundItems == '') {
			//if the app has never been started before then initialise items to an empty array
			window.localStorage.setItem("items", "[]");
		} else {
			app.items = JSON.parse(foundItems);
		}
		
		if(app.items.length == 0) {
			return;
		}
		
		app.calculateItems();
		app.populateElements();
		
		
	},
	
	calculateItems: function() {
		var lastTodayIndex = 0;
		var lastWeekIndex = 0;
		var lastMonthIndex = 0;
		var lastYearIndex = 0;
		
		var todaysDate = new Date();
		todaysDate.setHours(0, 0, 0, 0);
		
		var day = todaysDate.getDay();
		var dayDiff = todaysDate.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
		
		var weeksDate = todaysDate;
		weeksDate.setDate(dayDiff);
		var monthsDate = new Date(todaysDate.getFullYear(), todaysDate.getMonth(), 1);
		var yearsDate = new Date(todaysDate.getFullYear(), 0, 1);
		
		lastTodayIndex = app.calculateIndex(app.items.length, todaysDate);
		lastWeekIndex = app.calculateIndex(lastTodayIndex, weeksDate);
		lastMonthIndex = app.calculateIndex(lastWeekIndex, monthsDate);
		lastYearIndex = app.calculateIndex(lastMonthIndex, yearsDate);

		app.todaysPurchases = app.items.slice(lastTodayIndex, app.items.length); 
		app.weeksPurchases = app.items.slice(lastWeekIndex, app.items.length);
		app.monthsPurchases = app.items.slice(lastMonthIndex, app.items.length);
		app.yearsPurchases = app.items.slice(lastYearIndex, app.items.length);
		
		app.todaysValue = app.calculateValue(app.todaysPurchases);
		app.weeksValue = app.calculateValue(app.weeksPurchases);
		app.monthsValue = app.calculateValue(app.monthsPurchases);
		app.yearsValue = app.calculateValue(app.yearsPurchases);
	
	},
	
	calculateValue: function(currentItems) {
		var total = 0;
		
		currentItems.forEach(function(item) {
			total += parseFloat(item.value);
		});
		
		return total;
	},
	
	calculateIndex: function(start, comparisonDate) {
		var index = start;
		for(index = start; index > 0; index--) {
		var itemsDate = new Date(app.items[index-1].date);
			if( itemsDate >= comparisonDate){
				continue;
			}
			return index;
		}
		
		return index;
		
		
		//one element, not today
		//start = 1
		//returns 1
		//want to slice 1, 1
		
		//one element, today
		//start 1
		//returns 0
		//want to slice 0, 1
		
		//5 elements, 2 today
		//start 5
		//returns 3
		//want to slice 3, 5
		
		//
		
	},
	
	
	onDeviceReady: function() {
		
		//need to get all items, sort them into today, week, month, and year.
		//make a value for each and an array for each. need to make member variables
		
		//need to populate fields and tables
		app.initialiseValues();
		
	
		//make method that when form submitted updates values + headers, and adds to tables.
		
		
		$("#submit-item").submit(function(event) {
			event.preventDefault();
			
			var itemName = $("#itemName").val();
			var itemValue = $("#itemAmount").val();
			
			if(itemName == "" || itemValue == ""){
				return;
			}
			
			var item = new Object();
			item.date = new Date();
			item.name = itemName;
			item.value = itemValue;
			app.items.push(item);
			window.localStorage.setItem("items", JSON.stringify(app.items));
			app.calculateItems();
			app.populateElements();
			
			
		});
	},

	populateElements: function() {
		app.populateTable(app.todaysPurchases, "today-table");
		app.populateTable(app.weeksPurchases, "week-table");
		app.populateTable(app.monthsPurchases, "month-table");
		app.populateTable(app.yearsPurchases, "year-table");
	
		app.populateValue(app.todaysValue, "todayValue");
		app.populateValue(app.weeksValue, "weekValue");
		app.populateValue(app.monthsValue, "monthValue");
		app.populateValue(app.yearsValue, "yearValue");
	},
	
	populateValue: function(itemsValue, fieldName) {
		$("#" + fieldName).text("£" + itemsValue);
	},
	
	submitItem: function(item) {
	
		item.date = new Date();
		app.items.append(item);
		window.localStorage.setItem("items", app.items);
	}
};

$(document).ready(function() {
	
	var tableMap = new Object();
	tableMap['today-table'] = false;
	tableMap['week-table'] = false;
	tableMap['month-table'] = false;
	tableMap['year-table'] = false;
	
	for(var key in tableMap) {
		
		$("#" + 'expand-' + key).bind('click', {tableName: key}, function(event) {
			var amountTable = $("#" + event.data.tableName);
			var handling = tableMap[event.data.tableName];
			if(handling)
				return;
				
			handling = true;
			var isHidden = amountTable.attr('hidden');
			var faIcon = $(this).children("i")[0];
			
			if (typeof isHidden !== typeof undefined && isHidden !== false) {
				$(faIcon).removeClass("fa-arrow-down");
				$(faIcon).addClass("fa-arrow-up");
				amountTable.removeClass("animated fadeOutUp");
				amountTable.removeAttr("hidden");
				amountTable.addClass("animated fadeInDown");
			} else {
				$(faIcon).removeClass("fa-arrow-up");
				$(faIcon).addClass("fa-arrow-down");
				amountTable.removeClass("animated fadeInDown");
				amountTable.addClass("animated fadeOutUp");				
			}
			
			amountTable.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				if(amountTable.hasClass('fadeOutUp')) {
					amountTable.prop("hidden", "hidden");
				}
				
				handling = false;
			});
		});
	};
		

});
