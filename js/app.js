var app = angular.module('app', []);

var initialSharePrice = .50;

function FundingRound(fundingRounds, companyValue) {
	this.number = 0;
	this.amount = '';
	this.valuation = '';
	this.preference = false;
	this.preferenceAmount = 1;
	this.participating = false;
	this.participationStyle = 'bestOf';
	this.allRounds = fundingRounds;
	this.companyValue = companyValue;
	this.preMoneyShares = function() {
		var totalShares = this.companyValue.sharesIssued;
		for( var i = 0; i < this.number; i++) {
			totalShares += this.allRounds[i].sharesIssued();
		}
		return totalShares;
	};
	
	this.pricePerShare = function() {
		return this.valuation / this.preMoneyShares();
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

app.value('exitParameters', {
		months: 48,
		vested: 100
});


app.value('fundingRounds', []);

app.value('bigCompanyCompensation', {
	salary: 100000,
	interestRate: 5.75
});

app.controller('ExitValueController', ['employeeCompensation', 'companyValue', 'fundingRounds', 'exitParameters',
	'bigCompanyCompensation',
	function($empComp, $compVal, $fundingRounds, $exitParameters, $bigCoComp) {
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

	this.employeeSharesOwnable = function() {
		return $empComp.sharesOwnable * ($exitParameters.vested / 100);
	}

	this.getYourValue = function() {
	
		var calculateAmountToCommon = function() {
			var commonPool = oldThis.issuedShares();
			var commonAmount = oldThis.getCompanyValue();

			/* Check to see if the amount allocated to preferred stock
				is better or worse than a payout of the funds
			*/
			var participatingPool = 0;
			var participatingAmount = 0;

			for(var i = $fundingRounds.length - 1; i >= 0; i--) {
				var round = $fundingRounds[i];
				if(round.preference) {
					// pull out all non participating shares
					if(!round.participating) {
						// Pay out the preference and pull the shares out of the pool
						commonAmount = commonAmount - (round.amount * round.preferenceAmount);
						commonPool = commonPool - round.sharesIssued();
					}
					if(round.participating) {
						if('both' == round.participationStyle) {
							// Pay out the preference, but leave the shares to participate
							commonAmount = commonAmount - (round.amount * round.preferenceAmount);
						} else {
							participatingPool += round.sharesIssued();
							participatingAmount += round.amount * round.preferenceAmount;
						}
					}
				}
			}

			var pricePerCommonShare = commonPool / commonAmount;
			var amountIfParticipating = pricePerCommonShare * participatingPool;
			if(amountIfParticipating > participatingAmount) {
				commonPool -= participatingPool;
				commonAmount -= participatingAmount;
			}

			// Share holders don't have to pay debt
			if(0 > commonAmount) {
				commonAmount = 0;
			}

			return {
				commonPool: commonPool,
				commonAmount: commonAmount
			};
		};

		var commonStock = calculateAmountToCommon();

		return 1.0 * oldThis.employeeSharesOwnable() / commonStock.commonPool * commonStock.commonAmount;
	};

	this.getYourPrice = function() {
		return oldThis.employeeSharesOwnable() * $empComp.strikePricePerShare;
	};

	this.getYourNet = function() {
		return oldThis.getYourValue() - oldThis.getYourPrice();
	};

	this.getYourOwnership = function() {
		return 100.0 * oldThis.employeeSharesOwnable() / oldThis.issuedShares();
	};

	this.getInitialOwnership = function() {
		return 100.0 * $empComp.sharesOwnable / $compVal.sharesIssued;
	};

	this.bigCoExtraSalary = function() {
		var monthlyRateOfReturn = $bigCoComp.interestRate / (12 * 100);
		var diffPerMonth = ($bigCoComp.salary - $empComp.salary)/12;
		var amountExtra = 0;
		for(var i = 0; i < $exitParameters.months; i++) {
			amountExtra += diffPerMonth + amountExtra * monthlyRateOfReturn;
		}
		return amountExtra;
	};

	this.totalBigCoEarnings = function() {
		return oldThis.bigExtraSalary() + ($exitParameters.months / 12) * $empComp.salary;
	};

	this.totalStartupEarnings = function() {
		return oldThis.getYourNet() + ($exitParameters.months / 12) * $empComp.salary
	}
}]);

app.controller('CompanyController', ['companyValue', 'fundingRounds', '$scope', function($compVal, $fundingRounds, $scope) {
	this.$compVal = $compVal;
	this.$fundingRounds = $fundingRounds;

	var me = this;
	this.addFundingRound = function() {
		var round = new FundingRound(me.$fundingRounds, me.$compVal);
		round.number = me.$fundingRounds.length;
		me.$fundingRounds.push(round);
	};


}]);

app.controller('CompensationController', ['employeeCompensation', 'companyValue', function($empComp, $compVal) {
	this.$empComp = $empComp;
	this.$compVal = $compVal;
}]);

app.controller('ExitController', ['companyValue', 'exitParameters', function($compVal, $exitParams) {
	this.$compVal = $compVal;
	this.$exitParams = $exitParams;
}]);

app.controller('BigCompanyController', ['bigCompanyCompensation', function($bigCo) {
	this.$bigCo = $bigCo;
}]);

app.directive('format', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;


            ctrl.$formatters.unshift(function (a) {
                return $filter(attrs.format)(ctrl.$modelValue)
            });


            ctrl.$parsers.unshift(function (viewValue) {
                var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
                elem.val($filter('number')(plainNumber));
                return plainNumber;
            });
        }
    };
}]);
