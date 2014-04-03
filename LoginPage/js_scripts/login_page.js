LoginWindow = Ext.extend(Ext.Window, {
	UserFirstName: null,
	UserLastName: null,
	UserTroop: null,
	LoginButton: null,

	Init: function() {					
		this.UserFirstName = new Ext.form.TextField({
			fieldLabel: 'Имя'
		});
		
		this.UserLastName = new Ext.form.TextField({
			fieldLabel: 'Фамилия'
		});	
		
		this.UserTroop = new Ext.form.TextField({
			fieldLabel: '№ взвода'
		});	
		
		var innerPanel = new Ext.form.FormPanel({
			bodyStyle: 'padding:10px 10px 10px 10px',
			autoHeight: true,
			defaults: {
			    anchor: '100%'
			},			
			
			items: [
				this.UserFirstName,
				this.UserLastName,
				this.UserTroop
			]
		});
		
		this.LoginButton = new Ext.Button({
			text: 'Войти',
			iconCls: 'x-tbar-answer-test',
			border: true,
			disabled: false        
    	});
				
        innerPanel.addButton(this.LoginButton, this.onLogin, this);		
		
        this.add(innerPanel);
	},
	
	tools: [
        {
	        id: 'close',
	        hidden: true
        }
	],

	onLogin: function () {
	},
	
	constructor: function(config){
		arguments.callee.superclass.constructor.apply(this, arguments);
		this.Init();		
	}
});

Ext.onReady(function () {
	var testData = [
		['Аппаратная П-246М', 'apparatnaya_p_246m/apparatnaya_p_246m.htm'],
		['Аппаратура каналообразования П-301-О', 'app_can_p_301_o/app_can_p_301_o.htm'],
		['Многоканальная аппаратура тонального телеграфирования', 'ton_tel/ton_tel.htm'],
		['Аппаратура каналообразования П-302-О', 'app_can_p_302_o/app_can_p_302_o.htm'],
		['Общие сведения о кабельных линиях', 'kabel/kabel.htm'],
		['Цифровая система передачи MEGATRANS – 3M', 'megatrans_3m/megatrans_3m.htm'],
		['Аппаратура П-330-24', 'app_330_24/app_330_24.htm'],
		['Аппаратура П-331 "Импульс"', 'app_p_331/app_p_331.htm'],
		['Мультиплексор первичный (МП)', 'mult_perv/mult_perv.htm'],
		['Условия выполнения нормативов', 'usl_vip_norm/usl_vip_norm.htm'],
		['Устройство оконечных устройств связи', 'usr_okon_uzl_sv/usr_okon_uzl_sv.htm'],				
		['Устройство ИПП-12 и ГО-12', 'ustr_ipp12_i_go12/ustr_ipp12_i_go12.htm'],
		['Устройство ЛО и ВКО', 'ustr_lo_i_vko/ustr_lo_i_vko.htm'],
		['Устройство ПКЛ-296-302', 'ustr_pkl_296_302/ustr_pkl_296_302.htm'],
		['Устройство ЩКНЧ, ЩКВЧ, ДП, ДСВ', 'ustr_sknc_skvc_dp_dsv/ustr_sknc_skvc_dp_dsv.htm'],
		['Функциональная схема аппаратуры П-302-О', 'func_sch_app_p_302_o/func_sch_app_p_302_o.htm'],
		['Схемы измерений основных эл. хар.', 'shm_izm_osn_el_har/shm_izm_osn_el_har.htm'],
		['Общий тест', 'common_test/common_test.htm']        
	];
	
	for (var i = 0; i < testData.length; i++) {
		testData[i].unshift(i + 1);
	}
	
	var testsStore = new Ext.data.ArrayStore({
		fields: [
			{name: 'number'},
			{name: 'test_name'},
			{name: 'test_url'}
		]
	});
	
	testsStore.loadData(testData);
	
	var oGrid = new Ext.grid.GridPanel({
		store: testsStore,
		stripRows: true,
		title: 'Тесты',
		columns: [
			{
				header: '№',
				sortable: false,
				dataIndex: 'number',
				width: 30
			}, {
				header: 'Название теста', 
				sortable: false,
				dataIndex: 'test_name',
				width: 400
			}, {
				header: 'url',
				sortable: false,
				dataIndex: 'test_url',
				hidden: true
			}
		],
		listeners: {
			'rowclick': function (grid, rowIndex, e) {
				var activeRecordUrl = grid.store.data.items[rowIndex].get('test_url');
				window.location = '../tests/' + activeRecordUrl;
			}
		}
	});
	
	oTestSelectionPanel = new Ext.Panel({
		title: 'Выбор раздела',
		hidden: true,
		layout: 'fit',
		items: [oGrid]
	});
	
	var oViewPort = new Ext.Viewport({
		layout: 'fit',
		title: 'Тестирующая система',
		items: [oTestSelectionPanel]
	});
	
	function run() {
		var loginWindow = new LoginWindow({
			title: 'Авторизация',
			layout: 'fit',
			width: 400,
			
			onLogin: function () {
				var uFirstName = this.UserFirstName.getValue();
				var uLastName = this.UserLastName.getValue();
				var uTroop = this.UserTroop.getValue();
				
				if (uFirstName.length > 0 && uLastName.length > 0 && uTroop.length) {
					var currentDate = new Date();
					var twentyMins = new Date( currentDate.getTime() + 1000 * 60 * 1 );
					var expireDate = twentyMins;//.toGMTString();					
					
					Ext.util.Cookies.set('user_first_name', uFirstName, expireDate);
					Ext.util.Cookies.set('user_last_name', uLastName, expireDate);
					Ext.util.Cookies.set('user_troop', uTroop, expireDate);					
					
					this.hide();
					oTestSelectionPanel.show();
				}
			}
		});
		
		loginWindow.show();
	}
	run();
});