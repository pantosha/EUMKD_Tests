var TEST_TIME = 7;

var runner;
var task;

var oViewPort;
var oTimerPanel;

var uFirstName = null,
	uLastName = null,
	uTroop = null;


Number.prototype.inRange = function (a, b) {
	return (this <= a) && (this > b);
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ShuffleTest(test) {
	var result = {
		title: test.title,
		questions: []
	}
	
	var maxIndex = 0;
	for (var i = 1; i < test.questions.length; i++)
		if (test.questions[i].variants.length > test.questions[maxIndex].variants.length)
			maxIndex = i;
			
	result.questions.push(test.questions.splice(maxIndex, 1)[0]);
	
	while (test.questions.length > 0) {
		var index = getRandomInt(0, test.questions.length - 1);
		result.questions.push(test.questions.splice(index, 1)[0]);
	}
	
	return result;
}

NavigationControl = Ext.extend(Ext.FormPanel, {
	AnswerButton: null,
	ScipButton: null,

	bodyStyle: 'padding:0px 0px 0px 0px',
	autoHeight: true,
	defaults: {
		anchor: '100%'
	},	

	Init: function() {				
		this.ScipButton = new Ext.Button({
			text: 'Пропустить',			
			iconCls: "x-tbar-loading",
			border: true,
			disabled: false        
		});
		
		this.AnswerButton = new Ext.Button({
			text: 'Ответить',
			iconCls: 'x-tbar-answer-test',
			border: true,
			disabled: false        
    	});
				
        this.addButton(this.AnswerButton, this.onAnswer, this);
		this.addButton(this.ScipButton, this.onSkip, this);		
	},
	
	onAnswer: function () {	
	},
	
	onSkip: function () {
	},
	
	constructor: function(config){
		arguments.callee.superclass.constructor.apply(this, arguments);
		this.Init();		
	}
});

TestSelectionWnd = new Ext.extend(Ext.Window, {
	title: 'Выбор тем для теста',
	height: 500,
	width: 350,
	closable: false,
	
	variants: null,
	oMainPanel: null,
	
	onOk: function () {

	},
	
	Init: function () {
		var self = this;
		
		var topicVariants = [];
		
		for (var i = 0, l = this.variants.length; i < l; i++) {
			topicVariants.push(new Ext.form.Checkbox({
				boxLabel: this.variants[i],
				name: 'testTopic_' + i.toString(),
				checked: true
			}));
		}
		
		this.oMainPanel = new Ext.FormPanel({
			items: topicVariants,
			labelWidth: 10
		});
		
		var onSelectAll = function () {
			for (var i = 0, l = this.items.length; i < l; i++) {
				this.items.get(i).setValue(true);
			}
		}
		
		var onCancelAll = function () {
			for (var i = 0, l = this.items.length; i < l; i++) {
				this.items.get(i).setValue(false);
			}
		}
		
		this.oMainPanel.addButton('Выбрать все', onSelectAll, this.oMainPanel);
		this.oMainPanel.addButton('Отменить все', onCancelAll, this.oMainPanel);
		
		this.add(this.oMainPanel);
		this.addButton('Ок', this.onOk, this);
	},
	
	constructor: function (config) {
		arguments.callee.superclass.constructor.apply(this, arguments);
		this.Init();
	}
});

function InitControls(test) {
	if (typeof test === 'undefined') {
		test = {
			title: 'Общий тест',
			questions: []
		};
	}
	
	var oQuestionTabs = [];
	for (var i = 0; i < test.questions.length; i++) {
		var oQuestionPanel = new Ext.Panel({
			title: 'Вопрос №' + (i + 1).toString(),
			preventBodyReset: true,
			region: 'north',// 'center',
			width: 400,
			height: 100,
			html: test.questions[i].text
		});
		
		var oVariants;
		var answerVariants = [];
		
		switch(test.questions[i].type) {
			case 'Single answer':				
				for (var j = 0; j < test.questions[i].variants.length; j++)
					answerVariants.push({
						boxLabel: test.questions[i].variants[j].text,
						name: 'question_' + i.toString() + '_answer',
						inputValue: test.questions[i].variants[j].text
					});
					
				oVariants = new Ext.form.RadioGroup({
					columns: 1,
					items: answerVariants
				});
				break;
			case 'Multiply answers':
				for (var j = 0; j < test.questions[i].variants.length; j++)
					answerVariants.push({
						boxLabel: test.questions[i].variants[j].text,
						name: 'question_' + i.toString() + '_answer'
					});
					
				oVariants = new Ext.form.CheckboxGroup({
					columns: 1,
					items: answerVariants
				});
				break;
		}
		var oVariantsPanel = new Ext.Panel({
			autoScroll: true,		
			split: true,
			layout: 'hbox',
			width: 500,
			bodyStyle: 'padding:0px 0px 0px 0px',
			region: 'center',//'south',
			title: 'Варианты ответов',
			items: [oVariants]
		});
		
		var itemsToAdd = [oQuestionPanel, oVariantsPanel];
		
		if (test.questions[i].image != '') {
			var oImage = new Ext.BoxComponent({
				autoEl: {
					tag: 'img',
					src: test.questions[i].image
				},
				bodyStyle: 'padding:0px 0px 0px 0px'
			});
			
			var oImagePanel = new Ext.Panel({
				autoScroll: true,		
				split: true,
				region: 'east',
				layout: 'fit',
				title: 'Изображение',
				items: [oImage]
			});
			
			itemsToAdd.push(oImagePanel);
		}		
				
		oQuestionTabs.push(new Ext.Panel({
			autoScroll: true,		
			split: true,
			layout: 'border',		
			bodyStyle: 'padding:0px 0px 0px',
			title: (i + 1).toString(),
			items: itemsToAdd
		}));
	}	
	
	function onTabChange () {
		var at = oTabPanel.getActiveTab();
		if (at.rendered) {
			try {
				var masterPanelWidth = at.getInnerWidth();
				
				var questionPanel = at.get(0); 
				var variantsPanel = at.get(1);
								
				var firstHeight = oTabPanel.get(0).get(1).getHeight();				
				var height = firstHeight > 100 ? firstHeight : 100; // MagicNumber!
				//Ext.MessageBox.alert(firstHeight, height)
				
				variantsPanel.setHeight(height);
				
				if (at.items.length == 3) {
					var imagePanel = at.get(2);
					questionPanel.setWidth(masterPanelWidth * 0.5);
					imagePanel.setWidth(masterPanelWidth * 0.5);
				}
				else {
					var masterHeight = at.getInnerHeight();
					questionPanel.setHeight(masterHeight * 0.5);
					variantsPanel.setHeight(masterHeight * 0.5);
				}
				
				at.doLayout();
			} catch (e) {
				debugger;
			}
		}
	}
	
	function CheckTest() {
		var correctAnswers = 0;
		
		for (var i = 0; i < oTabPanel.items.length; i++) {
			var questionPanel = oTabPanel.get(i).get(1).get(0);
			
			var isCorrectAnswer = true;
			for (var j = 0; j < questionPanel.items.length; j++) {
				if (questionPanel.items.items[j].checked !== test.questions[i].variants[j].correct) {
					isCorrectAnswer = false;
					break;
				}
			}
			if (isCorrectAnswer == true) {
				correctAnswers++;
			}
			// switch ( questionPanel.getXType() ) {
				// case 'checkboxgroup':
					// break;
				// case 'radiogroup':
					// break;
			// }
		}
		
		runner.stop(task);
		
		var rightAnswersPercent = parseFloat(correctAnswers.toString()) / test.questions.length * 100.0;
		
		// ToDo: Упростить код
		var mark;

		if ((rightAnswersPercent).inRange(100, 90)) {
			mark = 10;
		} else
		if ((rightAnswersPercent).inRange(90, 80)) {
			mark = 9;
		} else
		if ((rightAnswersPercent).inRange(80, 70)) {
			mark = 8;
		} else
		if ((rightAnswersPercent).inRange(70, 60)) {
			mark = 7;
		} else
		if ((rightAnswersPercent).inRange(60, 50)) {
			mark = 6;
		} else
		if ((rightAnswersPercent).inRange(50, 40)) {
			mark = 5;
		} else
		if ((rightAnswersPercent).inRange(40, 30)) {
			mark = 4;
		} else
		if ((rightAnswersPercent).inRange(30, 20)) {
			mark = 3;
		} else {
			mark = 2
		}
		
		var userInfo = uFirstName + ' ' + uLastName + ' ' + uTroop;
		var resultString = 'Правильных ответов: ' + correctAnswers.toString() + '<br />' +
												'Всего вопросов: ' + test.questions.length + '<br />' +
												'Ваша оценка: ' + mark.toString();
		Ext.MessageBox.show({
			title: userInfo,
			msg: resultString,
			buttons: Ext.MessageBox.OK,
			fn: function (btn) {
				window.location.reload();
			}			
		});
	}
	
	var oTabPanel = new Ext.TabPanel({
		activeItem: 0,
		resizeTabs: true,
		region: 'center',		
		items: oQuestionTabs,
		
		tbChange: onTabChange,
		
		listeners: {
			tabChange: onTabChange
		},
		
		getNextTab: function () {
			var at = oTabPanel.getActiveTab();
			
			var prev = [];
			var next = [];
			var toAdd = prev;
			
			for (var i = 0; i < oTabPanel.items.length; i++) {
				if (oTabPanel.get(i) == at) {
					toAdd = next;
					continue;
				}
				
				if (oTabPanel.get(i).disabled === false) {
					toAdd.push(i);
				}
			}
			
			if (next.length === 0 && prev.length === 0) {
				return false;
			}
			
			if (next.length > 0) {
				oTabPanel.setActiveTab(next[0]);
				return true;
			}
			
			oTabPanel.setActiveTab(prev[0]);
			return true;
		}
	});
	
	var oNavigationPanel = new NavigationControl({		
		autoScroll: true,		
		split: true,
		layout: 'fit',	
		bodyStyle: 'padding:0px 0px 0px 0px',	
		region: 'south',
		
		onAnswer: function () {
			var at = oTabPanel.getActiveTab();
			var questionPanel = at.get(1).get(0);
			if (questionPanel.getXType() == 'radiogroup') {
				var answeredFlag = false;
				for (var i = 0; i < questionPanel.items.items.length; i++) {
					answeredFlag = answeredFlag || questionPanel.items.items[i].checked;
				}
				if (answeredFlag === false) {
					Ext.MessageBox.alert('Внимание!', 'Вы не выбрали ответ!');
					return;
				}
			}
			
			at.disable();
			
			if (oTabPanel.getNextTab() === false) {
				CheckTest();
			}
		},
		
		onSkip: function () {
			oTabPanel.getNextTab();
		}
	}); 
	
	var oTestTitlePanel = new Ext.Panel({		
		autoScroll: true,		
		split: true,
		layout: 'border',	
		bodyStyle: 'padding:0px 0px 0px 0px',	
		title: test.title,
		items: [oTabPanel, oNavigationPanel]
	});	
	
	var oTimerPanel = new Ext.Panel({
		autoScroll: true,
		split: true,
		layout: 'fit',
		bodyStyle: 'padding:0px 0px 0px 0px',	
		title: 'Осталось',
		items: [oTestTitlePanel]
	});
	
	return oTimerPanel;
}

Ext.onReady(function () {
    Ext.QuickTips.init();
	
	var topicNames = [];
	
	for (var topicName in topics) {
		topics[topicName] = Ext.util.JSON.decode(Base64.decode(topics[topicName]));
		topicNames.push(topics[topicName].title);
		topicsMap[topics[topicName].title] = topics[topicName];
	}
	
	var testSelectionWnd = new TestSelectionWnd({
		variants: topicNames,
		
		onOk: function () {
			var selectedVariants = [];

			this.oMainPanel.items.each(function (item) {
				if (item.checked === true) {
					selectedVariants.push(item.boxLabel);
				}
			});
			
			var common_test = {
				title: 'Общий тест',
				questions: []
			}
			
			if (selectedVariants.length == 0) {
				Ext.MessageBox.alert('Внимание', 'Вы ничео не выбрали!');
				return;
			}
			
			for (var i = 0, l = selectedVariants.length; i < l; i++) {
				var currentTest = topicsMap[selectedVariants[i]];

				Ext.each(currentTest.questions, function (question) {
					common_test.questions.push(question);
				});
			}

			var resTest = {
				title: 'Общий тест',
				questions: []				
			};

			while (resTest.questions.length < 15 && common_test.questions.length > 0) {
				var randIndex = getRandomInt(0, common_test.questions.length - 1);
				resTest.questions.push(common_test.questions.splice(randIndex, 1)[0]);
			}
			
			oTimerPanel = InitControls(resTest);
			
		    oViewPort = new Ext.Viewport({
		        layout: 'fit',
		        items: [oTimerPanel]
		    });
		
			oTimerPanel.get(0).get(0).tbChange();
		
			task = {
			    run: updateClock,
			    interval: 1000 //1 second
			}
			runner = new Ext.util.TaskRunner();
			runner.start(task);
						
			this.hide();
		}
	})
	
	testSelectionWnd.show();
	
	oTimerPanel = InitControls();
	
	var timeLeft = TEST_TIME * 60 * 1000;
	
	// Start a simple clock task that updates a div once per second
	var updateClock = function(){
		timeLeft -= 1000;
		
		if (timeLeft <= 0) {
			runner.stop(task);

			Ext.MessageBox.show({
				title: 'Внимание!',
				msg: 'Время отведенное на тест истекло!',
				buttons: Ext.MessageBox.OK,
				fn: function (btn) {
					window.location.reload();
				}
			});
		}
		
		var userInfo = uFirstName + ' ' + uLastName + ' ' + uTroop;
		oTimerPanel.setTitle('Осталось времени: ' + new Date(timeLeft).format('i:s') + '   ' + userInfo);
	} 

    oViewPort = new Ext.Viewport({
        layout: 'fit',
        items: [oTimerPanel]
    });

    oViewPort.on('resize', onViewPortResize);
    function onViewPortResize(component, adjWidth, adjHeight, rawWidth, rawHeight) {
    }
	
    function run() {
		uFirstName = Ext.util.Cookies.get('user_first_name');
		uLastName = Ext.util.Cookies.get('user_last_name');
		uTroop = Ext.util.Cookies.get('user_troop');
	
		if (uFirstName == null) uFirstName = '';
		if (uLastName == null) uLastName = '';
		if (uTroop == null) uTroop = '';
	
		oTimerPanel.hide();
    }

    var self = this;
    run();	
});