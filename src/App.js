import React, { Component } from 'react';
import './App.css';
import {Rnd} from 'react-rnd';
import {FaSearchPlus, FaSearchMinus, FaEdit, FaArrowsAlt} from 'react-icons/fa';
// import {IconContext} from 'react-icons';

const imgSrcArr = [
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1539177924149&di=ed1126e51917c7ad8f8326238ae396f9&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2F5fdf8db1cb134954582498475c4e9258d1094ade.jpg',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1539092287295&di=4d148f374153511bc38f407bcb552cf7&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimage%2Fc0%253Dshijue1%252C0%252C0%252C294%252C40%2Fsign%3D4e2de12d007b020818c437a20ab098a6%2F7af40ad162d9f2d37707ed67a3ec8a136327cc20.jpg'
];
// 标注区域的宽高
const regionWidth = 700;
const regionHeight = 500;
const regionRatio = regionWidth / regionHeight;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageAttr: {
        width: 10,
        height: 10,
        top: 10,
        left: 10
      },
      imageScale: 1, // 当前标注图片与原图的缩放比例
      currentLabelRect: {
        width: '',
        height: '',
        x: 0,
        y: 0
      },
      labelRectsList: [], // 所有标注框的列表
      currentStatus: 'inLabel' // inLabel or inMoving
    };
    this.initialScale = 1;
    this.initialWidth = 0;
    this.initialHeight = 0;
    this.inEditing = false;
    this.editingStartX = 0;
    this.editingStartY = 0;
    // bind
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
  }

  onImageLoaded = (e) => {
    let width, height, top, left, imageScale;
    let imageWidth = e.target.naturalWidth;
    let imageHeight = e.target.naturalHeight;
    let imageRatio = imageWidth / imageHeight;
    if(imageRatio > regionRatio) {
      width = imageWidth > regionWidth ? regionWidth : imageWidth;
      height = width / imageRatio;
    } else {
      height = imageHeight > regionHeight ? regionHeight : imageHeight;
      width = height * imageRatio;
    }
    imageScale = width / imageWidth;
    top = (regionHeight - height) / 2;
    left = (regionWidth - width) / 2;
    this.setState({
      imageAttr: {width, height, top, left},
      imageScale
    });
    this.initialScale = imageScale;
    this.initialWidth = imageWidth;
    this.initialHeight = imageHeight;
  }

  onResize = (idx, e, direction, ref, delta, position) => {
    let {labelRectsList} = this.state;
    labelRectsList[idx] = {
      width: ref.style.width,
      height: ref.style.height,
      ...position,
    }
    this.setState({
      labelRectsList
    });
  }

  onResizeStop = (idx, e, direction, ref, delta, position) => {
    console.log('x: ', position.x, ',y: ', position.y, ',width: ', ref.style.width, ',height: ', ref.style.height);
  }

  // 阻止冒泡，防止对rnd组件操作触发onMouseMove
  onDrag = (e) => {
    e && e.stopPropagation();
  }

  onDragStop = (idx, e, d) => {
    let {labelRectsList} = this.state;
    let w = labelRectsList[idx].width;
    let h = labelRectsList[idx].height;
    labelRectsList[idx] = {
      width: w,
      height: h,
      x: d.x,
      y: d.y
    }
    this.setState({
      labelRectsList
    });
    console.log('x: ', d.x, ',y: ', d.y, ',width: ', w, ',height: ', h);
  }

  onClickLabel = () => {
    this.setState({
      currentStatus: 'inLabel'
    });
  }
  onClickMove = () => {
    this.setState({
      currentStatus: 'inMoving'
    });
  }
  onMouseDown = (e) => {
    let {currentStatus, currentLabelRect:newLabelRect} = this.state;
    this.editingStartX = e.nativeEvent.offsetX;
    this.editingStartY = e.nativeEvent.offsetY;
    if(currentStatus === 'inLabel') {
      if(e.target.getAttribute('class') === 'labelRegion') {
        newLabelRect.x = e.nativeEvent.offsetX;
        newLabelRect.y = e.nativeEvent.offsetY;
        newLabelRect.width = '0%';
        newLabelRect.height = '0%';
        this.setState({
          currentLabelRect: newLabelRect
        });
      }
    }else if(currentStatus === 'inMoving') {

    }
    this.inEditing = true;
  }
  onMouseMove = (e) => {
    let {currentStatus, currentLabelRect:newLabelRect, imageAttr} = this.state;
    if(currentStatus === 'inLabel') {
      if(this.inEditing && e.target.getAttribute('class') === 'labelRegion') {
        newLabelRect.width = Math.abs(e.nativeEvent.offsetX - this.editingStartX) * 100 / imageAttr.width + '%';
        newLabelRect.height = Math.abs(e.nativeEvent.offsetY - this.editingStartY) * 100 / imageAttr.height + '%';
        if(e.nativeEvent.offsetX - newLabelRect.x < 0) {
          newLabelRect.x = e.nativeEvent.offsetX;
          newLabelRect.y = e.nativeEvent.offsetY;
        }
        this.setState({
          currentLabelRect: newLabelRect
        });
      }
    }else if(currentStatus === 'inMoving') {
      if(this.inEditing && e.target.getAttribute('class') === 'labelRegion') {
        imageAttr.top += (e.nativeEvent.offsetY - this.editingStartY) * 0.15;
        imageAttr.left += (e.nativeEvent.offsetX - this.editingStartX) * 0.15;
        this.setState({
          imageAttr
        });
      }
    }
  }
  onMouseUp = (e) => {
    let {currentStatus, currentLabelRect, labelRectsList} = this.state;
    if(currentStatus === 'inLabel') {
      // drag stop会触发mouse up，防止push空的数据
      if(this.inEditing && currentLabelRect.width !== '') {
        labelRectsList.push(currentLabelRect);
        this.setState({
          labelRectsList,
          currentLabelRect: {
            width: '',
            height: '',
            x: 0,
            y: 0
          }
        });
      }
    }else if(currentStatus === 'inMoving') {

    }
    this.inEditing = false;
  }

  onZoomIn = () => {
    let {imageScale, imageAttr: {width, height, top, left}, labelRectsList} = this.state;
    if(imageScale < 1.3) {
      let oldScale = imageScale;
      imageScale += 0.1;
      width = imageScale * this.initialWidth;
      height = imageScale * this.initialHeight;
      top = (regionHeight - height) / 2;
      left = (regionWidth - width) / 2;
      this.setState({
        imageAttr: {width, height, top, left},
        imageScale
      });
      labelRectsList.forEach((item) => {
        item.x *= imageScale / oldScale;
        item.y *= imageScale / oldScale;
      })
      this.setState({
        labelRectsList
      });
    }
  }
  onZoomOut = () => {
    let {imageScale, imageAttr: {width, height, top, left}, labelRectsList} = this.state;
    if(imageScale > 0.5) {
      let oldScale = imageScale;
      imageScale -= 0.1;
      width = imageScale * this.initialWidth;
      height = imageScale * this.initialHeight;
      top = (regionHeight - height) / 2;
      left = (regionWidth - width) / 2;
      this.setState({
        imageAttr: {width, height, top, left},
        imageScale
      });
      labelRectsList.forEach((item) => {
        item.x *= imageScale / oldScale;
        item.y *= imageScale / oldScale;
      })
      this.setState({
        labelRectsList
      });
    }
  }

  render() {
    let {currentLabelRect:{width, height, x, y}, imageAttr, labelRectsList, currentStatus} = this.state;
    let resizeHandleStyle = {
      width: 8,
      height: 8,
      backgroundColor: 'white',
      borderRadius: '50%'
    };
    return (
      <div>
        <div className="header">
          <span>请调节框的大小和位置确定标注区域，并在右侧添加或选择标签。</span>
          <span className="editor-region">
            <i className="editor-region-label" onClick={this.onClickLabel}>
              <FaEdit />
            </i>
            <i className="editor-region-move" onClick={this.onClickMove}>
              <FaArrowsAlt />
            </i>
            <i className="editor-region-zoom-in" onClick={this.onZoomIn}>
              <FaSearchPlus />
            </i>
            <i className="editor-region-zoom-out" onClick={this.onZoomOut}>
              <FaSearchMinus />
            </i>
          </span>
        </div>
        <div className="App"
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
        >
          <img src={imgSrcArr[1]}
            className="uploadImage"
            style={{...imageAttr}}
            onLoad={this.onImageLoaded}
            alt="标注图片"
          >
          </img>
          <div className="labelRegion" 
            style={{...imageAttr, cursor: (currentStatus === 'inMoving') ? 'move' : 'crosshair'}}
          >
            {width !== '' && (
              <Rnd
                className="rnd"
                style={{display: 'flex'}}
                size={{ width, height}}
                position={{ x: x , y: y}}
                bounds="parent"
              >
              </Rnd>
            )}
            {
              labelRectsList.map((labelItem, index) => {
                return (
                  <Rnd
                    className="rnd"
                    style={{display: 'flex'}}
                    size={{ width: labelItem.width, height: labelItem.height}}
                    position={{ x: labelItem.x , y: labelItem.y}}
                    onDrag={this.onDrag}
                    onDragStop={this.onDragStop.bind(this, index)}
                    onResize={this.onResize.bind(this, index)}
                    onResizeStop={this.onResizeStop.bind(this, index)}
                    bounds="parent"
                    // resizeHandleClasses={{topLeft: 'resizeHandle', topRight: 'resizeHandle', bottomLeft: 'resizeHandle', bottomRight: 'resizeHandle'}}
                    resizeHandleStyles={{
                      topLeft: {...resizeHandleStyle, left: -4, top: -4},
                      topRight: {...resizeHandleStyle, right: -4, top: -4},
                      bottomLeft: {...resizeHandleStyle, left: -4, bottom: -4},
                      bottomRight: {...resizeHandleStyle, right: -4, bottom: -4}
                    }}
                    key={index}
                  >
                  </Rnd>
                );
              })
            }
          </div>
        </div>
      </div>

    );
  }
}

export default App;
