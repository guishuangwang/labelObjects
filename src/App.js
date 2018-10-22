import React, { Component } from 'react';
import './App.css';
import {Rnd} from 'react-rnd';
import {FaSearchPlus, FaSearchMinus, FaEdit, FaArrowsAlt, FaTrash} from 'react-icons/fa';
// import {IconContext} from 'react-icons';
import {calculateRectXY} from './utils';

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
      currentLabelRect: { // 当前框选区域
        width: 0,
        height: 0,
        x: 0,
        y: 0
      },
      labelRectsList: [], // 所有标注框的列表
      currentStatus: 'inLabel', // inLabel or inMoving
      currentLabelTags: [], // 当前右侧标签列表
      showTagInput: false // 是否展现tag输入框
    };
    this.initialScale = 1;
    this.initialWidth = 0;
    this.initialHeight = 0;
    this.inEditing = false;
    this.editingStartX = 0;
    this.editingStartY = 0;
    this.currentRectIndex = 0; // 当前操作的矩形索引
    // bind
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    // this.onDragStop = this.onDragStop.bind(this);
    // this.onResize = this.onResize.bind(this);
    // this.onResizeStop = this.onResizeStop.bind(this);
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
    e && e.stopPropagation();
    let {labelRectsList} = this.state;
    labelRectsList[idx] = Object.assign({}, labelRectsList[idx], {
      width: ref.style.width,
      height: ref.style.height,
      ...position,
    });
    this.setState({
      labelRectsList
    });
  }

  onResizeStop = (idx, e, direction, ref, delta, position) => {
    console.log('x: ', position.x, ',y: ', position.y, ',width: ', ref.style.width, ',height: ', ref.style.height);
    this.currentRectIndex = idx;
  }

  // 阻止冒泡，防止对rnd组件操作触发onMouseMove
  onDrag = (e) => {
    e && e.stopPropagation();
  }

  onDragStop = (idx, e, d) => {
    let {labelRectsList} = this.state;
    let w = labelRectsList[idx].width;
    let h = labelRectsList[idx].height;
    labelRectsList[idx] = Object.assign({}, labelRectsList[idx], {
      width: w,
      height: h,
      x: d.x,
      y: d.y
    });
    this.setState({
      labelRectsList
    });
    console.log('x: ', d.x, ',y: ', d.y, ',width: ', w, ',height: ', h);
    this.currentRectIndex = idx;
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
        newLabelRect.width = 0;
        newLabelRect.height = 0;
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
        newLabelRect.width = Math.abs(e.nativeEvent.offsetX - this.editingStartX);
        newLabelRect.height = Math.abs(e.nativeEvent.offsetY - this.editingStartY)
        // newLabelRect.width = Math.abs(e.nativeEvent.offsetX - this.editingStartX) * 100 / imageAttr.width + '%';
        // newLabelRect.height = Math.abs(e.nativeEvent.offsetY - this.editingStartY) * 100 / imageAttr.height + '%';
        // if(e.nativeEvent.offsetX - newLabelRect.x < 0) {
        //   newLabelRect.x = e.nativeEvent.offsetX;
        //   newLabelRect.y = e.nativeEvent.offsetY;
        // }
        // 根据滑动方向确定选框的位置参数
        let rectXY = calculateRectXY(this.editingStartX, this.editingStartY, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        newLabelRect.x = rectXY.x;
        newLabelRect.y = rectXY.y;
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
    let {currentStatus, currentLabelRect: {width, height, x, y}, labelRectsList, imageAttr} = this.state;
    if(currentStatus === 'inLabel') {
      // drag stop会触发mouse up，防止push空的数据
      if(this.inEditing && width !== 0 && height !== 0) {
        // push前将宽高转换成百分比形式，给rnd组件使用
        labelRectsList.push({
          width: `${width * 100 / imageAttr.width}%`,
          height: `${height * 100 / imageAttr.height}%`,
          x,
          y
        });
        this.setState({
          labelRectsList,
          currentLabelRect: {
            width: 0,
            height: 0,
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

  // 删除当前标注
  onDeleteCurrentLabel = (index, e) => {
    let {labelRectsList} = this.state;
    labelRectsList.splice(index, 1);
    this.setState({
      labelRectsList
    });
  }

  // 点击添加标签
  onAddLabelTag = (e) => {
    this.setState({
      showTagInput: true
    });
  }

  // 确认输入，添加标签
  onConfirmInput = (e) => {
    let {currentLabelTags} = this.state;
    this.inputTag.value && currentLabelTags.push(this.inputTag.value);
    this.setState({
      currentLabelTags,
      showTagInput: false
    });
  }

  // 取消输入
  onCancelInput = (e) => {
    this.setState({
      showTagInput: false
    });
  }

  // 点击右侧标签
  onChooseCurrentTag = (tagName, e) => {
    let {labelRectsList} = this.state;
    let currentRectIndex = this.currentRectIndex;
    labelRectsList[currentRectIndex].labelName = tagName;
    this.setState({
      labelRectsList
    });
  }

  // 保存当前标注数据
  onSaveLabelData = (e) => {
    let {labelRectsList, imageScale} = this.state;
    console.log('标注数据：', labelRectsList);
    console.log('图片缩放比例：', imageScale);
  }

  render() {
    let {currentLabelRect:{width, height, x, y}, imageAttr, labelRectsList, currentStatus, currentLabelTags, showTagInput} = this.state;
    let resizeHandleStyle = {
      width: 8,
      height: 8,
      backgroundColor: 'white',
      borderRadius: '50%'
    };
    return (
      <div>
        <div className="App clearfix">
          <div className="app-label-region">
            <div className="header">
              <span>请调节框的大小和位置确定标注区域，并在右侧添加或选择标签。</span>
              <span className="editor-region">
                <i className="editor-region-label" onClick={this.onClickLabel}>
                  <FaEdit color={currentStatus === 'inLabel' ? '#0776dd' : null}/>
                </i>
                <i className="editor-region-move" onClick={this.onClickMove}>
                  <FaArrowsAlt color={currentStatus === 'inMoving' ? '#0776dd' : null}/>
                </i>
                <i className="editor-region-zoom-in" onClick={this.onZoomIn}>
                  <FaSearchPlus />
                </i>
                <i className="editor-region-zoom-out" onClick={this.onZoomOut}>
                  <FaSearchMinus />
                </i>
              </span>
            </div>
            <div className="imageContainer"
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
                {width !== 0 && height !== 0 && (
                  // <Rnd
                  //   className="rnd"
                  //   style={{display: 'flex'}}
                  //   size={{ width, height}}
                  //   position={{ x: x , y: y}}
                  //   bounds="parent"
                  // >
                  // </Rnd>
                  <div 
                    className="currentRect"
                    style={{width, height, top: y, left: x}}
                  >
                  </div>
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
                        resizeHandleStyles={{
                          topLeft: {...resizeHandleStyle, left: -4, top: -4},
                          topRight: {...resizeHandleStyle, right: -4, top: -4},
                          bottomLeft: {...resizeHandleStyle, left: -4, bottom: -4},
                          bottomRight: {...resizeHandleStyle, right: -4, bottom: -4}
                        }}
                        key={index}
                      >
                        <div className="label-name-region">
                          <i className="label-del" onClick={this.onDeleteCurrentLabel.bind(this, index)}>
                            <FaTrash />
                          </i>
                          <span>{labelItem.labelName || '请在右侧选择或添加新标签'}</span>
                        </div>
                      </Rnd>
                    );
                  })
                }
              </div>
            </div>
          </div>
          <div className="app-tags-region">
            <div className="label-tags-header">
                <span>标签</span>
            </div>
            <div className="label-tags-container">
                <div className="add-label-tag" onClick={this.onAddLabelTag}>+ 添加标签</div>
                {showTagInput && (
                  <div className="input-tag-region">
                    <input type="text" placeholder="输入字母/数字" className="input-label-tag" ref={(inputTag) => {this.inputTag = inputTag}}></input>
                    <div className="input-confirm-cancel">
                      <span onClick={this.onConfirmInput}>确定&nbsp;</span>
                      <span onClick={this.onCancelInput}>取消</span>
                    </div>
                  </div>
                )}
                <ul className="current-added-tags-ul">
                  {currentLabelTags.map((tag, index) => {
                    return (
                      <li className="current-added-tags-li" key={index} onClick={this.onChooseCurrentTag.bind(this, tag)}>
                        {tag}
                      </li>
                    )
                  })}
                </ul>
            </div>
          </div>
        </div>
        <div className="save-label-data" onClick={this.onSaveLabelData}>
          保存
        </div>
      </div>
    );
  }
}

export default App;
