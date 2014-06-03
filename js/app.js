var app = angular.module('app', []);

var initialSharePrice = .50;

app.value('employeeCompensation', {
		sharesOwnable: 20000,
		strikePricePerShare: initialSharePrice,
		salary: 80000
});

app.value('companyValue', {
		sharesIssued: 1000000,
		pricePerShare: initialSharePrice,
		exitValue: 0,
		companyValue: function() {
			return this.sharesIssued * this.pricePerShare;
		}
});

app.controller('ExitValueController', ['employeeCompensation', 'companyValue', function($empComp, $compVal) {
	this.$empComp = $empComp;
	this.$compVal = $compVal;

	var oldThis = this;
	this.getCompanyValue = function() {
		return $compVal.companyValue();
	};

	this.getYourValue = function() {
		return $empComp.sharesOwnable * $compVal.pricePerShare;
	};

	this.getYourPrice = function() {
		return $empComp.sharesOwnable * $empComp.strikePricePerShare;
	};

	this.getYourNet = function() {
		return oldThis.getYourValue() - oldThis.getYourPrice();
	};

	this.getYourOwnership = function() {
		return 100.0 * $empComp.sharesOwnable / $compVal.sharesIssued;
	}
}]);

app.controller('CompanyController', ['companyValue', function($compVal) {
	this.$compVal = $compVal;

}]);

app.controller('CompensationController', ['employeeCompensation', 'companyValue', function($empComp, $compVal) {
	this.$empComp = $empComp;
	this.$compVal = $compVal;
}]);

app.controller('ExitController', ['employeeCompensation', 'companyValue', function($empComp, $compVal) {
	this.$empComp = $empComp;
	this.$compVal = $compVal;

	this.getExitValue = function() {
		if($compVal.pricePerShare == $empComp.strikePricePerShare) {
			return 0;
		} else {
			return $compVal.sharesIssued * $compVal.pricePerShare;
		}
	};

	this.setExitValue = function() {
		var value = event.target.value;
		$compVal.pricePerShare = (value / $compVal.sharesIssued);
	};

}]);