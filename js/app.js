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
		exitAmount: 0,
		totalSharesIssued: 1000000
});


app.value('fundingRounds', []);

app.controller('ExitValueController', ['employeeCompensation', 'companyValue',  'fundingRounds', function($empComp, $compVal, $fundingRounds) {
	this.$empComp = $empComp;
	this.$compVal = $compVal;

	var oldThis = this;

	this.issuedShares = function() {
		var totalShares = $compVal.sharesIssued;
		angular.forEach($fundingRounds, function(round, idx) {
			totalShares += round.sharesIssued();
		});

		return totalShares;
	};

	this.getCompanyValue = function() {
		if(0 < $compVal.exitAmount ) {
			return $compVal.exitAmount;
		} else if(0 < $fundingRounds.length) {
			var lastRound = $fundingRounds.slice(-1)[0];
			return parseInt(lastRound.valuation) + parseInt(lastRound.amount);
		} else {
			return $compVal.totalSharesIssued * initialSharePrice;
		}
	};

	this.getYourValue = function() {
	
		var calculateAmountToCommon = function() {
			var commonPool = oldThis.issuedShares();
			var commonAmount = oldThis.getCompanyValue();

			for(var i = $fundingRounds.length - 1; i >= 0; i--) {
				var round = $fundingRounds[i];
				if(round.preference) {

				}
			}

			return {
				commonPool: commonPool,
				commonAmount: commonAmount
			};
		};

		var commonStock = calculateAmountToCommon();

		return 1.0 * $empComp.sharesOwnable / commonStock.commonPool * commonStock.commonAmount;
	};

	this.getYourPrice = function() {
		return $empComp.sharesOwnable * $empComp.strikePricePerShare;
	};

	this.getYourNet = function() {
		return oldThis.getYourValue() - oldThis.getYourPrice();
	};

	this.getYourOwnership = function() {
		return 100.0 * $empComp.sharesOwnable / oldThis.issuedShares();
	}

	this.getInitialOwnership = function() {
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

app.controller('ExitController', ['companyValue',  function($compVal) {
	this.$compVal = $compVal;
}]);