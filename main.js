(() => {
    window.addEventListener('load', init);

    let fileSelector; //파일 경로 설정
    let imgSource;
    let canvasInputHistogram;
    let canvasOutputHistogram;
    let maskButtonHendler;

    const brightnessLevel = 256;


    function init() {
        fileSelector = document.querySelector('input#fileload'); //input 의 fileload 와 연결
        fileSelector.addEventListener('change', fileChangeHandler);  //리스너 추가. change 형식의 fileChangeHandler 등록

        imgSource = document.querySelector('img#img_source'); // img 태그의 img_source와 연결
        imgSource.addEventListener('load', imgLoadHandler);
        canvasInputHistogram = document.querySelector('canvas#canvas1');
        canvasOutputHistogram = document.querySelector('canvas#canvas2');
        maskButtonHendler = document.querySelector('button#mask');

    }

    function fileChangeHandler(event) {
        let file = event.target.files[0]; // 이벤트 타겟 설정. 이때 타겟은 file[0] 즉 선택된 파일이 대상이 된다.

        if (!file.type.startsWith('image/')) { // 유효성 검사. 파일 선택된 것이 image 형식이 아니면 return
            alert("not image");
            return;
        }

        let filereader = new FileReader();
        filereader.onload = function () {
            imgSource.src = filereader.result; // 이미지 onload 에 성공할 시 imgSource 의 src를 result(파일 경로) 로 설정한다.
        }

        filereader.readAsDataURL(file);
    } // changeHander 

    function imgLoadHandler(event) { // 이미지가 로딩되면 히스토그램을 각각 그리는 명령을 하는 함수
        let img = event.target; //파일 로드 타겟을 img 로 실시.
        let imgData = getImageData(img);
        let histogramData = drawHistogram(imgData, canvasInputHistogram);
        let equalisedData = getEqualisedImage(histogramData.histogram, histogramData.count, canvasOutputHistogram);

    } // imgLoadHandler



    function getImageData(img) { //히스토그램 대상 사진 정보의 기본정보를 구하는 함수
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        context.drawImage(img, 0, 0);

        let result = context.getImageData(0, 0, canvas.width, canvas.height);

        canvas.remove();
        return result;
    } //getImageData


    function drawHistogram(imgData, canvasInputHistogram) { //히스토그램 그리기 위한 정보를 구하는 함수

        let count = imgData.data.length / 4;
        var histogram = [];

        for (let a = 0; a < brightnessLevel; a += 1) {
            histogram[a] = 0;
        }

        for (let i = 0; i < count; i += 1) {
            let offset = 4 * i;
            let r = imgData.data[offset + 0];
            let g = imgData.data[offset + 1];
            let b = imgData.data[offset + 2];
            histogram[getLight(r, g, b)] += 1;
        }
        drawgraph(canvasInputHistogram, histogram, count);
        return {
            histogram: histogram,
            count: count
        };

    } //drawHistogram

    function drawgraph(canvas, histogram, count) { //그래프 그려주는 함수


        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);


        context.beginPath();
        context.strokeStyle = '#00ff00';
        let maxHistogram = Math.max(...histogram);
        for (let j = 0; j < brightnessLevel; j += 1) {
            context.moveTo((j / brightnessLevel) * canvas.width, canvas.height);
            context.lineTo((j / brightnessLevel) * canvas.width, (1 - histogram[j] / maxHistogram) * canvas.height);
            context.stroke();
        }

        context.beginPath();
        context.strokeStyle = '#ff0000';
        let accumulated = histogram[0];
        context.moveTo(0, (1 - accumulated / count) * canvas.height);
        for (let j = 1, accl = 0; j < brightnessLevel; j += 1) {
            accumulated += histogram[j];
            context.lineTo(j / brightnessLevel * canvas.width, (1 - accumulated / count) * canvas.height);
            context.stroke();
        }
    } // drawgraph

    function getLight(r, g, b) {
        return Math.round(r * 0.299 + g * 0.587 + b * 0.114);
    }





    function getEqualisedImage(histogramData, count, canvasOutputHistogram) {

        let dataEqualised = [];
        let high = Math.max(...histogram);
        let low = Math.min(...histogram);

        
        for(let i = 0; i<brightnessLevel; i += 1){
            dataEqualised[i] = 0;
        }
        for (let j = 0, accl = 0; j < brightnessLevel; j += 1) {
            accl += histogramData[j];
            dataEqualised[j] = accl;
        }


    } //히스토그램을 평활화 한다.


})();