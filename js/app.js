var app = angular.module('app', []);

app.value('equityValue', {
		sharesIssued: 1000000,
		sharesOwnable: 20000,
		pricePerShare: .50,
		strikePricePerShare: .50
});

app.controller('EquityValueController', ['equityValue', function(equityValue) {
	this.equityValue = equityValue;

	var oldThis = this;
	this.getCompanyValue = function() {
		return equityValue.sharesIssued * equityValue.pricePerShare;
	};

	this.getYourValue = function() {
		return equityValue.sharesOwnable * equityValue.pricePerShare;
	};

	this.getYourPrice = function() {
		return equityValue.sharesOwnable * equityValue.strikePricePerShare;
	};

	this.getYourNet = function() {
		return oldThis.getYourValue() - oldThis.getYourPrice();
	};

	this.getYourOwnership = function() {
		return 100.0 * equityValue.sharesOwnable / equityValue.sharesIssued;
	}

}]);

app.controller('CompensationController', ['equityValue', function(equityValue) {
	this.equityValue = equityValue;
}]);

app.controller('ExitController', ['equityValue', function(equityValue) {
	this.equityValue = equityValue;

	this.getExitValue = function() {
		if(equityValue.pricePerShare == equityValue.strikePricePerShare) {
			return 0;
		} else {
			return equityValue.sharesIssued * equityValue.pricePerShare;
		}
	};

	this.setExitValue = function() {
		var value = event.target.value;
		equityValue.pricePerShare = (event.target.value / equityValue.sharesIssued);
	};

}]);