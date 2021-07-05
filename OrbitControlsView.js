import * as React from 'react';
import { View, Platform, PanResponder } from 'react-native';
import { OrbitControls } from './OrbitControls';
function polyfillEventTouches(nativeEvent) {
    if (Platform.OS === 'web')
        return nativeEvent;
    if (!Array.isArray(nativeEvent.touches))
        nativeEvent.touches = [];
    if (Array.isArray(nativeEvent.changedTouches)) {
        if (!nativeEvent.touches.length) {
            nativeEvent.touches = nativeEvent.changedTouches;
        }
    }
    return nativeEvent;
}
const OrbitControlsView = React.forwardRef(({ camera, ...props }, ref) => {
    var _a;
    const [size, setSize] = React.useState(null);
    const viewRef = React.useRef(null);
    const controls = React.useMemo(() => {
        var _a;
        if (camera && ((_a = viewRef) === null || _a === void 0 ? void 0 : _a.current)) {
            return new OrbitControls(camera, viewRef.current);
        }
        return null;
    }, [camera, (_a = viewRef) === null || _a === void 0 ? void 0 : _a.current]);
    React.useImperativeHandle(ref, () => ({
        getControls() {
            return controls;
        },
    }), [controls]);
    const responder = React.useMemo(() => {
        function onTouchEnded(nativeEvent) {
            var _a;
            const polyfill = polyfillEventTouches(nativeEvent);
            // If only one touch then we may be encountering the bug where pan responder returns a two finger touch-end event in two different calls. :/
            // RNGH doesn't have this issue.
            const isMisfiredNativeGesture = Platform.OS !== 'web' && nativeEvent.identifier > 1;
            if (isMisfiredNativeGesture) {
                return;
            }
            return (_a = controls) === null || _a === void 0 ? void 0 : _a.onTouchEnd(polyfill);
        }
        return PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderGrant({ nativeEvent }) {
                var _a;
                return (_a = controls) === null || _a === void 0 ? void 0 : _a.onTouchStart(nativeEvent);
            },
            onPanResponderMove({ nativeEvent }) {
                var _a;
                return (_a = controls) === null || _a === void 0 ? void 0 : _a.onTouchMove(nativeEvent);
            },
            onPanResponderRelease({ nativeEvent }) {
                return onTouchEnded(nativeEvent);
            },
            onPanResponderTerminate({ nativeEvent }) {
                return onTouchEnded(nativeEvent);
            },
        });
    }, [controls]);
    React.useEffect(() => {
        if (!controls || !size) {
            return;
        }
        controls.width = size.width;
        controls.height = size.height;
    }, [size, controls]);
    return (<View {...props} ref={viewRef} {...responder.panHandlers} onLayout={event => {
        if (props.onLayout) {
            props.onLayout(event);
        }
        setSize(event.nativeEvent.layout);
    }}/>);
});
export default OrbitControlsView;
//# sourceMappingURL=OrbitControlsView.js.map