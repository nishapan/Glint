# Glint Code Challenge - Simple analytics web app

## App URL 

https://thawing-everglades-79716.herokuapp.com/

### Features completed
```A drop down menu to filter data by fiscal year.
```A pie chart that breaks down the revenue data by product.
```A table that displays the detailed revenue data based on pie chart product selection and fiscal year. Revenues below average are in bold. 
```The table is editable and allows user to update all fields including year, product, country and revenue. Basic validation include checking for valid data format. e.g. making sure year is 4 digits and numeric. Revenue validation check extracts digits from the input, and convert data with “Million” suffix back to actual integer, if the field is empty, it returns 0.
```Testing is done on desktop browsers including Chrome, Firefox and Safari and mobile devices including iPhone and iPad. 

### Implementation details
The single page app is hosted on Heroku using Node backend and React frontend. Rational: Node setup is quick and React allows for component reuse and auto UI update management.
I created a Node.js endpoint on my Heroku server to host the revenue data. https://thawing-everglades-79716.herokuapp.com/api/pie (I wasn’t clear on whether the challenge wanted me to use an existing API hosted elsewhere) 

### Known issues
React throws runtime warnings indicating that the table content is editable, therefore not managed by React. This is a known React warning which will be silenced their future release.
Negative revenue values can cause the pie chart to disappear if the sum adds up to zero net revenue. 
I’m using a trial version of 3rd party pie chart API by CanvasJS. The  pie chart UI has a watermark at the bottom displaying “Trial version”.
Pie chart title text uses CanvasJS CSS therefore its font size and weight might be slight off on certain browsers when compared to Fiscal Year and product detail table title. 

