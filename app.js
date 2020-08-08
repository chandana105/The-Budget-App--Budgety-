// Module pattern

// BUDGET CONTROLLER
var budgetController = (function () {
  // expense object
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // cal percentages
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  // getting percentages
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  // income object
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (curr) {
      sum += curr.value;
    });
    data.totals[type] = sum;
  };

  /*
  0
  [200,500,700]
  sum =0 +200 = 200
  200 + 500 = 700
  700 +700 = 1400 in the end
  */

  // GLOBAL DATA MODEL
  // data structure in whcih to add the data ie new item
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      // [1 2 3 4 5], next id =6
      // [1 2 4 6 8], nextid =9
      // ID = last ID + 1

      // CREATE NEW ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // ie inc[inc.length - 1]
      // inc[5-1]
      // inc[4].id
      // income array ke 4th leemtn ki id ie lets say 5
      // 5 +1
      // 6
      // ID = 6 is used for the currentnewitem to become

      // CREATE NEW ITEM BASED ON 'Inc' or 'exp' TYPE
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
        // if we get to know abt the type then expense objects will be made , to keep them in series  we needed id
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      // PUSH IT INTO OUR DATA STRUCTURE
      data.allItems[type].push(newItem);

      // RETURN THE NEW ELEMENT
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;
      // id = 6
      // data.allItems[type][id]
      // ids =[1 2 4 6 8]
      // index = 3
      // after deletign [1 2 4 8]

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      // console.log(ids);

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal('inc');
      calculateTotal('exp');

      // Calculate the Budget : incomes - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
      // expense = 100, inc = 200 : 100/200 = 50% = 0.5 * 100 , so this result ll be in dec we want interger part so math.round
    },

    calculatePercentages: function () {
      /**
       a=10,
       b=20,
       c=40
       income = 100
       a = 10/100 = 10%
       b = 20/100 = 20%
       c = 40/100 = 40%
       */

      // for each element in array we re calling cb fxn to calculate Percentages
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    // loop over all the expenxse coz we want togetpece method on each of our objects, wewantmap method as to retrun them
    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

// Module that handles UI
// UI CONTROLLER
var UIController = (function () {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec;
    /**
     + or - before number
     exactly 2 decimal points
     comma seperating the thousands

     2310.4567 -> + 2,310.46  -eg1
     2000 -> + 2,000.00
     */

    //  to cal absolute part of a number ie if it is -2000 then it should be simply 2000
    //abs simply removes the sign of number

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 2310 output 2,310  so 23510-> 23,510
    }
    dec = numSplit[1];

    // type === 'exp' ? sign = '-' : sign = '+';

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  //declarinf nodelist xn
  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>';
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
      }

      // Replace the placeholder text with some actual data

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);

      // document.getElementById(selectorID).parentNode.removeChild(document.getElementById(selectorID));
    },

    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ', ' + DOMstrings.inputValue
      );
      // console.log(fields); //nodelist aayegi

      // to convert nodelist to array:
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, array) {
        current.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = 'inc') : (type = 'exp');

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '----';
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); //it ll return nodelist

      //calling a fxn
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function () {
      var now, months, month, year;

      now = new Date();
      // var christmas = new Date(2020, 12, 25);
      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      month = now.getMonth(); //coming as numbers as it is zero based so lets write months

      year = now.getFullYear();

      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + ' ' + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          ',' +
          DOMstrings.inputDescription +
          ',' +
          DOMstrings.inputValue
      );

      // this returns the nodelist so we wll use the previous made fxn
      nodeListForEach(fields, function (cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

// GLOBAL APP CONTROLLER

var controller = (function (budgetCtrl, UIctrl) {
  var setupEventListeners = function () {
    var DOM = UIctrl.getDOMstrings(); //3

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UIctrl.changedType);
  };

  var updateBudget = function () {
    //6

    // 1.Calculate the budget
    budgetCtrl.calculateBudget();

    // 2.Return the budget
    var budget = budgetCtrl.getBudget();

    // 3.Display the budget on the UI
    UIctrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    // 1.Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2.Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    //jo array aarha hai cinolse mein ie har jo obj bnrha expense ka uski har vlaue ke liye perce bn rhi hai [5,25] ie 5 ll be exp[1]'s perc nd so on

    // 3.Update the UI with the new percentages
    UIctrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function () {
    //5
    // declaring all varibles
    var input, newItem;

    // 1. Get the field input data
    input = UIctrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3.Add the item to the UI as well
      UIctrl.addListItem(newItem, input.type);

      // 4.Clear the fields
      UIctrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      // 6.Calculate and update the percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    // console.log(itemID);

    if (itemID) {
      // now we ahve all th eraw data t obe able to delete item fro mbbtoh ui nd data structre nd budgetcorle
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
      // till here

      // 1. delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2.Detete the item from UI
      UIctrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4.Calculate and update the percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log('Application started');
      UIctrl.displayMonth();
      UIctrl.displayBudget({
        //4
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });

      setupEventListeners(); //2
    },
  };
})(budgetController, UIController);

// wtithout this line of code nth is going tohappen s thee ll be no eventlist nd ethut them thre llbe no inpt data , there ll be no app
controller.init(); //1
