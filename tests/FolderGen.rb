require 'fileutils'

puts 'Enter test name:'
test_name = gets.chomp

HTML = <<-html
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Тестирующая система</title>

		<!-- Ext stylesheets -->
		<link rel="stylesheet" type="text/css" href="../../ext-3.4.0/resources/css/ext-all.css"/>
		
		<!-- LIBS -->
		<script type="text/javascript" src="../../ext-3.4.0/adapter/ext/ext-base.js"></script>
		<script type="text/javascript" src="../../ext-3.4.0/ext-all-debug-w-comments.js"></script>

		<script src="js_scripts/question.js" type="text/javascript" charset="utf-8"></script>
		<script src="../test.js" type="text/javascript" charset="utf-8"></script>
		<script src="../base64.js" type="text/javascript" charset="utf-8"></script>				
    </head>
    <body>
    </body>
</html>
html

FileUtils.mkdir "#{test_name}"
FileUtils.mkdir "#{test_name}/js_scripts"
FileUtils.touch "#{test_name}/#{test_name}.htm"

File.open("#{test_name}/#{test_name}.htm", "w") do |f|
  f.puts HTML
end

FileUtils.touch "#{test_name}/js_scripts/question.js"

puts "<li><a href=\"#{test_name}/#{test_name}.htm\">{{DESCRIPTION}}</a></li>"