// Budget Controller

var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      expense: [],
      income: []
    },

    totals: {
      expense: 0,
      income: 0
    },

    budget: 0,

    percentage: -1
  };

  var calculateTotal = function(type) {
    var sum = 0;

    data.allItems[type].forEach(function(current) {
      sum = sum + current.value;
    });

    data.totals[type] = sum;
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      // create new ID

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item based on 'income' or 'expense' type

      if (type === 'expense') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'income') {
        newItem = new Income(ID, des, val);
      }

      //Push it into our data structure

      data.allItems[type].push(newItem);

      // return the new element

      return newItem;
    },

    calculateBudget: function() {
      // calculate total income and expenses

      calculateTotal('income');

      calculateTotal('expense');

      // calculate the budget: income - expenses

      data.budget = data.totals.income - data.totals.expense;

      //calculate the percentage of income that we spent

      if (data.totals.income > 0) {
        data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculateIndPercentage: function() {
      data.allItems.expense.forEach(function(current) {
        current.calculatePercentage(data.totals.income);
      });
    },

    getPercentage: function() {
      var allPercentages = data.allItems.expense.map(function(current) {
        return current.getPercentage();
      });

      return allPercentages;
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.income,
        totalExpenses: data.totals.expense,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

// UI Controller
var UIController = (function() {
  var DOMStrings = {
    inputDescription: '.add-description',
    inputValue: '.add-value',
    inputType: '.add-type',
    checkButton: '.check-button',
    expensesList: '.list-expenses',
    incomeList: '.list-income',
    budgetLabel: '.budget-value',
    expensesLabel: '.expenses-value',
    incomeLabel: '.income-value',
    percentageLabel: '.percentage-value',
    listContainer: '.general-list-container',
    percentageItem: '.item-percentage',
    dateLabel: '.budget-title-date',
    iconMonth: '.icon-month',
    inputContainer: '.add-container'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === 'expense' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        text: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;

      // create HTML string with placeholder text

      if (type === 'income') {
        element = DOMStrings.incomeList;
        html =
          "<div class='item-list-container clear' id='income-%id%'><div class='item-description'>%description%</div><div class='value-right'><div class='item-value clear value-color-income'>%value%</div><div class='delete-container'><button class='delete-item'>x</button></div></div></div>";
      } else if (type === 'expense') {
        element = DOMStrings.expensesList;
        html =
          "<div class='item-list-container clear' id='expense-%id%'><div class='item-description'>%description%</div><div class='value-right'><div class='item-value clear value-color-expenses'>%value%</div><div class='item-percentage'>%21%%</div><div class='delete-container'><button class='delete-item'>x</button></div></div></div></div>";
      }

      //replace the placeholder text with some actual data

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      //insert the html into the DOM

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    clearFields: function() {
      var fields, fieldsArray;

      fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(current, index, array) {
        current.value = '';
      });

      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {
      var type;

      obj.budget > 0 ? (type = 'income') : (type = 'expense');

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'expense');
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'income');

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '--';
      }
    },

    displayItemPercentage: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.percentageItem);

      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '--';
        }
      });
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);

      el.parentNode.removeChild(el);
    },

    displayDate: function() {
      var year, month, months, now, icon, season;

      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
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
        'December'
      ];

      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

      icon = document.querySelector(DOMStrings.iconMonth);

      switch (month) {
        case 2:
        case 3:
        case 4:
          season = 'spring';
          break;
        case 5:
        case 6:
        case 7:
          season = 'summer';
          break;
        case 8:
        case 9:
        case 10:
          season = 'autumn';
          break;
        case 11:
        case 0:
        case 1:
          season = 'winter';
          break;
        default:
          icon.src = 'img/summer.gif';
      }

      icon.src = 'img/' + season + '.gif';
    },

    getDOMStrings: function() {
      return DOMStrings;
    }
  };
})();

//Global App Cotroller

var controller = (function(budgetCtr, UICtrl) {
  var setUpEventListeners = function() {
    var DOM = UIController.getDOMStrings();

    document.querySelector(DOM.checkButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(e) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.listContainer).addEventListener('click', ctrlDeleteItem);
  };

  var updateBudget = function() {
    var budget;

    //  Calculate the budget.

    budgetController.calculateBudget();

    // return the budget

    budget = budgetController.getBudget();

    //  Display the budget on the UI.

    UIController.displayBudget(budget);
  };

  var updateIndivPercentage = function() {
    var percentages;

    budgetController.calculateIndPercentage();

    percentages = budgetController.getPercentage();

    UIController.displayItemPercentage(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    // 1. Get the field input data.

    input = UIController.getInput();

    if (input.text !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller.

      newItem = budgetController.addItem(input.type, input.text, input.value);

      // 3. Add the item to the UI.

      UIController.addListItem(newItem, input.type);

      // clear fields

      UIController.clearFields();

      updateBudget();

      updateIndivPercentage();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // delete the item from the data structure

      budgetController.deleteItem(type, ID);

      // delete the item from the UI

      UIController.deleteListItem(itemID);

      // update and show the new totals

      updateBudget();

      updateIndivPercentage();
    }
  };

  return {
    init: function() {
      setUpEventListeners();
      UIController.displayDate();
    }
  };
})(budgetController, UIController);

controller.init();
