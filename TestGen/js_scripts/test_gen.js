Ext.onReady(function () {
	Ext.QuickTips.init();
	
	var oTestTitle = new Ext.form.TextField({
		fieldLabel: 'Заголовок',
		width: 250
	});
	
	var oTestTitleFS = new Ext.form.FieldSet({
		items: [oTestTitle]
	});
	
	function addQuestion() {
		var oQuestionText = new Ext.form.TextField({
			fieldLabel: 'Текст вопроса',
			width: 300
		});
		
		var oQuestionImage = new Ext.form.TextField({
			width: 300,
			fieldLabel: 'Изображения'
		});
		
		var oQuestionTextFS = new Ext.form.FieldSet({
			items: [oQuestionText, oQuestionImage],
			region: 'north',
			height: 80
		});
		
		var oAnswersFS = new Ext.form.FieldSet({
			text: 'Варианты ответов'
		});
		
		var oAnswersPanel = new Ext.form.FormPanel({
			autoScroll: true,
			region: 'center',
		});
		
		var AddAnswerButton = new Ext.Button({
			text: 'Добавить вариант ответа',
			iconCls: 'x-tbar-answer-test',
			border: true,
			disabled: false        
		});
		
		var DeleteQuestionButton = new Ext.Button({
			text: 'Удалить вопрос',
			iconCls: 'x-tbar-answer-test',
			border: true,
			disable: false
		});
		oAnswersPanel.addButton(DeleteQuestionButton, function () {
			oTestDetailsPanel.remove(oTestDetailsPanel.getActiveTab(), true);
			var index = 0;
			oTestDetailsPanel.items.each(function (panel) {
				panel.setTitle( (++index).toString() );
			});
		}, oAnswersPanel);
		
		oAnswersPanel.addButton(AddAnswerButton, function () {
			var oAnswerText = new Ext.form.TextField({
				fieldLabel: 'Вариант: ' + (this.items.length / 3 + 1).toString(),
				width: 700
			});
			
			var oRightAnswer = new Ext.form.Checkbox({
				checked: false,
				boxLabel: 'Правильный ответ'
			});
			
			var oDeleteAnswerButton = new Ext.Button({
				text: 'Удалить вариант',
				border: true,
				disable: false,

			});
			oDeleteAnswerButton.on('click', function () {
				this.remove(oAnswerText, true);
				this.remove(oRightAnswer, true);
				this.remove(oDeleteAnswerButton, true);
				var index = 0;
				this.items.each(function (i) {
					if (i.getXType() == 'textfield') {
						i.label.update( 'Вариант ' + (++index).toString() );
					}
				});
			}, this);
			
			var oVariant = {
				AnswerText: oAnswerText,
				RightAnswer: oRightAnswer
			};
			
			this.add(oVariant.AnswerText);
			this.add(oDeleteAnswerButton);	
			this.add(oVariant.RightAnswer);

			this.doLayout();
		}, oAnswersPanel)
	
		var oQuestionPanel = new Ext.Panel({
			title: (oTestDetailsPanel.items.length + 1).toString(),
			layout: 'border',
			
			autoSize: true,
			items: [oQuestionTextFS, oAnswersPanel]
		});
		
		oTestDetailsPanel.add(oQuestionPanel);
		oTestDetailsPanel.setActiveTab(oTestDetailsPanel.items.length - 1);
	}
	
	var oTestNavigationPanel = new Ext.Panel({
		title: 'Навигация',
		region: 'west',
		items: [oTestTitleFS]
	});
	
	var oAddQuestionButton = new Ext.Button({
		text: 'Добавить вопрос',
		iconCls: 'x-tbar-answer-test',
		border: true,
		disabled: false        
	});
		
	var oSaveTestButton = new Ext.Button({
		text: 'Сохранить тест',
		iconCls: 'x-tbar-answer-test',
		border: true,
		disabled: false        
	});		
	
	function saveTest () {
		var test = {
			title: oTestNavigationPanel.get(0).get(0).getValue(),
			questions: []
		};
		
		var errors = false;
		
		oTestDetailsPanel.items.each(function (questionPanel) {
			var question = {
				text: questionPanel.get(0).get(0).getValue(),
				image: questionPanel.get(0).get(1).getValue(),
				type: '',
				variants: []
			};
			
			var answersText = [];
			var answersCorrect = [];
			var correctAnswersCount = 0;
			
			questionPanel.get(1).items.each(function (answerVariant) {
				switch ( answerVariant.getXType() ) {
					case 'textfield':
						answersText.push( answerVariant.getValue() );
						break;
					case 'checkbox':
						answersCorrect.push(answerVariant.checked);
						correctAnswersCount += answerVariant.checked ? 1 : 0;
						break;
				}
			});
			
			for (var i = 0; i < answersText.length; i++) {
				question.variants.push({
					text: answersText[i],
					correct: answersCorrect[i]
				});
			}
			
			if (correctAnswersCount == 0) {
				errors = true;
				Ext.MessageBox.alert('Внимание!', questionPanel.title + ' не содержит правильного ответа');
				return;
			}
			
			question.type = correctAnswersCount == 1 ? 'Single answer' : 'Multiply answers'; 
			
			test.questions.push(question);
		});
		
		if (!errors) {
var descriptionText	= "В каталоге <b>tests</b> создайте новый каталог с названием теста<br />\
В него скопируйте файл <b>test.htm</b> и создайте каталог <b>js_scripts</b><br />\
В каталоге <b>js_scripts</b> создайте файл <b>question.js</b> содержащий следующий текст";
			
var testText = "<pre>function getTest() {\n\
\treturn '" + Base64.encode(JSON.stringify(test)) + "';\n\
}";
			var oDescriptionPanel = new Ext.Panel({
				preventBodyReset: true,
				autoScroll: true,
				border: true,
				region: 'north',
				html: descriptionText
			});

			var oQuestionPanel = new Ext.Panel({
				preventBodyReset: true,
				border: true,
				autoScroll: true,
				region: 'center',
				html: testText
			});	

			var oWindow = new Ext.Window({
				title: 'Результат работы',
				layout: 'border',
				width: 400,
				height: 300,
				items: [oDescriptionPanel, oQuestionPanel]
			});
			oWindow.show();
		}
	}
		
	oTestNavigationPanel.addButton(oSaveTestButton, saveTest, this);			
	oTestNavigationPanel.addButton(oAddQuestionButton, addQuestion, this);	
			
	var oTestDetailsPanel = new Ext.TabPanel({
		title: 'Вопрос',			
		activeItem: 0,
		region: 'center'
	});
	
	var oMainPanel = new Ext.Panel({
		title: 'Редактор тестов',
		layout: 'border',
		items: [oTestNavigationPanel, oTestDetailsPanel]
	});
	
	var oViewPort = new Ext.Viewport({
		layout: 'fit',
		items: [oMainPanel]
	});
	
    oViewPort.on('resize', onViewPortResize);

    function onViewPortResize(component, adjWidth, adjHeight, rawWidth, rawHeight) {
		var masterPanelWidth = oMainPanel.getWidth();
		oTestNavigationPanel.setWidth(0.3 * masterPanelWidth);
		oTestDetailsPanel.setWidth(0.7 * masterPanelWidth);
		oMainPanel.doLayout();
    }
	
	function run() {
		onViewPortResize();
	}
	run();
});