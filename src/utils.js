/**
 * 鼠标按住框选区域时，根据方向计算出矩形框的左上角坐标
 */
export const calculateRectXY = (oldX, oldY, newX, newY) => {
    let deltaX = newX - oldX;
    let deltaY = newY - oldY;
    if(deltaX > 0 && deltaY > 0) {
        // 往右下角滑
        return {
            x: oldX,
            y: oldY
        };
    }else if(deltaX < 0 && deltaY < 0) {
        // 往左上角滑
        return {
            x: newX,
            y: newY
        };
    }else if(deltaX < 0 && deltaY > 0) {
        // 往左下角滑
        return {
            x: newX,
            y: oldY
        };
    }else {
        // 往右上角滑
        return {
            x: oldX,
            y: newY
        };
    }
}