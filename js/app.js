var app = angular.module('app', []);

var initialSharePrice = .50;

function FundingRound() {
	this.number = 0;
	this.amount = '';
	this.valuation = '';
	this.preference = false;
	this.preferenceAmount = 1;
	this.participating = false;
	this.participationStyle = 'bestOf';
	this.preMoneyShares = 1;
	this.pricePerShare = function() {
		return this.valuation / this.preMoneyShares;
	};
	this.sharesIssued = function() {
		return this.amount / this.pricePerShare(); 
	};
};

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

app.value('fundingRounds', []);

app.controller('ExitValueController', ['employeeCompensation', 'companyValue',  'fundingRounds', function($empComp, $compVal, $fundingRounds) {
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

app.controller('CompanyController', ['companyValue', 'fundingRounds', '$scope', function($compVal, $fundingRounds, $scope) {
	this.$compVal = $compVal;
	this.$fundingRounds = $fundingRounds;

	var me = this;
	this.addFundingRound = function() {
		var round = new FundingRound();
		round.number = me.$fundingRounds.length;
		round.preMoneyShares = me.$compVal.sharesIssued;
		me.$fundingRounds.push(round);
	};


}]);

app.controller('CompensationController', ['employeeCompensation', 'companyValue', function($empComp, $compVal) {
	this.$empComp = $empComp;
	this.$compVal = $compVal;
}]);

app.controller('ExitController', ['employeeCompensation', 'companyValue', 'fundingRounds', function($empComp, $compVal, $fundingRounds) {
	this.$empComp = $empComp;
	this.$compVal = $compVal;
	this.$fundingRounds = $fundingRounds;

	this.getExitValue = function() {
		if($compVal.pricePerShare == $empComp.strikePricePerShare) {
			return 0;
		} else {
			return $compVal.sharesIssued * $compVal.pricePerShare;
		}
	};

	this.setExitValue = function() {
		debugger;
		var value = event.target.value;
		var sharesIssued = $compVal.sharesIssued;
		angular.forEach($fundingRounds, function(round,number) {
			sharesIssued += round.sharesIssued();
		});

		$compVal.pricePerShare = (value / sharesIssued);
	};

}]);