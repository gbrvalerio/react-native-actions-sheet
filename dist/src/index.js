var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/* eslint-disable curly */
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, } from 'react';
import { Animated, BackHandler, Dimensions, Easing, Modal, PanResponder, Platform, SafeAreaView, StatusBar, TouchableOpacity, View, } from 'react-native';
import EventManager, { actionSheetEventManager } from './eventmanager';
import { RouterContext, RouterParamsContext, useRouter, } from './hooks/use-router';
import useSheetManager from './hooks/use-sheet-manager';
import { useKeyboard } from './hooks/useKeyboard';
import { SheetProvider, useProviderContext, useSheetIDContext } from './provider';
import { getZIndexFromStack, isRenderedOnTop, SheetManager, } from './sheetmanager';
import { styles } from './styles';
import { getElevation, SUPPORTED_ORIENTATIONS } from './utils';
export default forwardRef(function ActionSheet(_a, ref) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    var _r = _a.animated, animated = _r === void 0 ? true : _r, _s = _a.closeOnPressBack, closeOnPressBack = _s === void 0 ? true : _s, _t = _a.springOffset, springOffset = _t === void 0 ? 50 : _t, _u = _a.elevation, elevation = _u === void 0 ? 5 : _u, _v = _a.defaultOverlayOpacity, defaultOverlayOpacity = _v === void 0 ? 0.3 : _v, _w = _a.overlayColor, overlayColor = _w === void 0 ? 'black' : _w, _x = _a.closable, closable = _x === void 0 ? true : _x, _y = _a.closeOnTouchBackdrop, closeOnTouchBackdrop = _y === void 0 ? true : _y, onTouchBackdrop = _a.onTouchBackdrop, _z = _a.drawUnderStatusBar, drawUnderStatusBar = _z === void 0 ? false : _z, _0 = _a.gestureEnabled, gestureEnabled = _0 === void 0 ? false : _0, _1 = _a.isModal, isModal = _1 === void 0 ? true : _1, _2 = _a.snapPoints, snapPoints = _2 === void 0 ? [100] : _2, _3 = _a.initialSnapIndex, initialSnapIndex = _3 === void 0 ? 0 : _3, _4 = _a.overdrawEnabled, overdrawEnabled = _4 === void 0 ? true : _4, _5 = _a.overdrawFactor, overdrawFactor = _5 === void 0 ? 15 : _5, _6 = _a.overdrawSize, overdrawSize = _6 === void 0 ? 100 : _6, _7 = _a.zIndex, zIndex = _7 === void 0 ? 999 : _7, _8 = _a.keyboardHandlerEnabled, keyboardHandlerEnabled = _8 === void 0 ? true : _8, ExtraOverlayComponent = _a.ExtraOverlayComponent, payload = _a.payload, safeAreaInsets = _a.safeAreaInsets, routes = _a.routes, initialRoute = _a.initialRoute, onBeforeShow = _a.onBeforeShow, enableRouterBackNavigation = _a.enableRouterBackNavigation, onBeforeClose = _a.onBeforeClose, props = __rest(_a, ["animated", "closeOnPressBack", "springOffset", "elevation", "defaultOverlayOpacity", "overlayColor", "closable", "closeOnTouchBackdrop", "onTouchBackdrop", "drawUnderStatusBar", "gestureEnabled", "isModal", "snapPoints", "initialSnapIndex", "overdrawEnabled", "overdrawFactor", "overdrawSize", "zIndex", "keyboardHandlerEnabled", "ExtraOverlayComponent", "payload", "safeAreaInsets", "routes", "initialRoute", "onBeforeShow", "enableRouterBackNavigation", "onBeforeClose"]);
    snapPoints =
        snapPoints[snapPoints.length - 1] !== 100
            ? __spreadArray(__spreadArray([], snapPoints, true), [100], false) : snapPoints;
    var initialValue = useRef(-1);
    var actionSheetHeight = useRef(0);
    var safeAreaPaddingTop = useRef((safeAreaInsets === null || safeAreaInsets === void 0 ? void 0 : safeAreaInsets.top) || 0);
    var internalEventManager = React.useMemo(function () { return new EventManager(); }, []);
    var currentContext = useProviderContext();
    var currentSnapIndex = useRef(initialSnapIndex);
    var minTranslateValue = useRef(0);
    var keyboardWasVisible = useRef(false);
    var prevKeyboardHeight = useRef(0);
    var id = useSheetIDContext();
    var sheetId = props.id || id;
    var lock = useRef(false);
    var panViewRef = useRef();
    var deviceContainerRef = useRef(null);
    var isOrientationChanging = useRef(false);
    var gestureBoundaries = useRef({});
    var hiding = useRef(false);
    var payloadRef = useRef(payload);
    var initialWindowHeight = useRef(Dimensions.get('screen').height);
    var _9 = useState({
        width: Dimensions.get('window').width,
        height: 0,
        portrait: true,
        paddingBottom: (props === null || props === void 0 ? void 0 : props.useBottomSafeAreaPadding) ? 25 : 0
    }), dimensions = _9[0], setDimensions = _9[1];
    var _10 = useSheetManager({
        id: sheetId,
        onHide: function (data) {
            hideSheet(undefined, data, true);
        },
        onBeforeShow: function (data) {
            var _a;
            (_a = routerRef.current) === null || _a === void 0 ? void 0 : _a.initialNavigation();
            onBeforeShow === null || onBeforeShow === void 0 ? void 0 : onBeforeShow(data);
        },
        onContextUpdate: function () {
            if (sheetId) {
                SheetManager.add(sheetId, currentContext);
                SheetManager.registerRef(sheetId, currentContext, {
                    current: getRef()
                });
            }
        }
    }), visible = _10.visible, setVisible = _10.setVisible;
    var animations = useState({
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(0),
        underlayTranslateY: new Animated.Value(100),
        keyboardTranslate: new Animated.Value(0),
        routeOpacity: new Animated.Value(0)
    })[0];
    var router = useRouter({
        routes: routes,
        getRef: function () { return getRef(); },
        initialRoute: initialRoute,
        onNavigate: props.onNavigate,
        onNavigateBack: props.onNavigateBack,
        routeOpacity: animations.routeOpacity
    });
    var routerRef = useRef(router);
    payloadRef.current = payload;
    routerRef.current = router;
    var keyboard = useKeyboard(keyboardHandlerEnabled && visible && dimensions.height !== 0, true, function () { return null; }, function () {
        // Don't run `hideKeyboard` callback if the `showKeyboard` hasn't ran yet.
        // Fix a race condition when you open a action sheet while you have the keyboard opened.
        if (initialValue.current === -1) {
            return;
        }
        keyboardAnimation(false);
    });
    var notifyOffsetChange = function (value) {
        internalEventManager.publish('onoffsetchange', value);
    };
    var returnAnimation = React.useCallback(function (velocity) {
        if (!animated) {
            animations.translateY.setValue(initialValue.current);
            return;
        }
        var config = props.openAnimationConfig;
        var correctedValue = initialValue.current > minTranslateValue.current
            ? initialValue.current
            : 0;
        notifyOffsetChange(correctedValue);
        Animated.spring(animations.translateY, __assign(__assign({ toValue: initialValue.current, useNativeDriver: true }, config), { velocity: typeof velocity !== 'number' ? undefined : velocity })).start();
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animated, props.openAnimationConfig]);
    var keyboardAnimation = React.useCallback(function (shown) {
        if (shown === void 0) { shown = true; }
        Animated.spring(animations.keyboardTranslate, {
            toValue: shown ? -keyboard.keyboardHeight : 0,
            useNativeDriver: true
        }).start();
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animated, props.openAnimationConfig, keyboard]);
    var opacityAnimation = React.useCallback(function (opacity) {
        Animated.timing(animations.opacity, {
            duration: 150,
            easing: Easing["in"](Easing.ease),
            toValue: opacity,
            useNativeDriver: true
        }).start();
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
    var hideAnimation = React.useCallback(function (vy, callback) {
        if (!animated) {
            callback === null || callback === void 0 ? void 0 : callback({ finished: true });
            return;
        }
        var config = props.closeAnimationConfig;
        opacityAnimation(0);
        var animation = Animated.spring(animations.translateY, __assign({ velocity: typeof vy !== 'number' ? 3.0 : vy + 1, toValue: dimensions.height * 1.3, useNativeDriver: true }, config));
        animation.start();
        setTimeout(function () {
            animation.stop();
            callback === null || callback === void 0 ? void 0 : callback({ finished: true });
        }, 150);
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        animated,
        dimensions.height,
        opacityAnimation,
        props.closeAnimationConfig,
    ]);
    var getCurrentPosition = React.useCallback(function () {
        //@ts-ignore
        return animations.translateY._value <= minTranslateValue.current + 5
            ? 0
            : //@ts-ignore
                animations.translateY._value;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var getNextPosition = React.useCallback(function (snapIndex) {
        return (actionSheetHeight.current +
            minTranslateValue.current -
            (actionSheetHeight.current * snapPoints[snapIndex]) / 100);
    }, [snapPoints]);
    var hardwareBackPressEvent = useRef();
    var Root = isModal && !(props === null || props === void 0 ? void 0 : props.backgroundInteractionEnabled) ? Modal : Animated.View;
    useEffect(function () {
        var listener = animations.translateY.addListener(function (value) {
            var _a;
            var correctedValue = value.value > minTranslateValue.current ? value.value : 0;
            (_a = props === null || props === void 0 ? void 0 : props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, correctedValue, actionSheetHeight.current);
            if (drawUnderStatusBar) {
                if (lock.current)
                    return;
                var correctedHeight = keyboard.keyboardShown
                    ? dimensions.height - keyboard.keyboardHeight
                    : dimensions.height;
                var correctedOffset = keyboard.keyboardShown
                    ? value.value - keyboard.keyboardHeight
                    : value.value;
                if (actionSheetHeight.current > correctedHeight - 1) {
                    if (correctedOffset < 100) {
                        animations.underlayTranslateY.setValue(Math.max(correctedOffset, 0));
                    }
                    else {
                        //@ts-ignore
                        if (animations.underlayTranslateY._value < 100) {
                            animations.underlayTranslateY.setValue(100);
                        }
                    }
                }
            }
        });
        return function () {
            listener && animations.translateY.removeListener(listener);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        props === null || props === void 0 ? void 0 : props.id,
        dimensions.height,
        keyboard.keyboardShown,
        keyboard.keyboardHeight,
    ]);
    var onDeviceLayoutReset = useRef({});
    var onDeviceLayout = React.useCallback(function (event) {
        var _a;
        var windowDimensions = Dimensions.get('window');
        var isPortraitMode = windowDimensions.height > windowDimensions.width;
        if (isOrientationChanging.current)
            return;
        if (keyboard.keyboardShown && !isModal) {
            return;
        }
        // If this is a modal, simply use window dimensions
        // for a more accurate height value for the action sheet.
        var deviceHeight = isModal
            ? windowDimensions.height
            : event.nativeEvent.layout.height;
        var deviceWidth = isModal
            ? windowDimensions.width
            : event.nativeEvent.layout.width;
        (_a = onDeviceLayoutReset.current.sub) === null || _a === void 0 ? void 0 : _a.unsubscribe();
        onDeviceLayoutReset.current.sub = internalEventManager.subscribe('safeAreaLayout', function () {
            var _a, _b;
            (_a = onDeviceLayoutReset.current.sub) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            var safeMarginFromTop = Platform.OS === 'ios'
                ? safeAreaPaddingTop.current || 0
                : StatusBar.currentHeight || 0;
            var height = deviceHeight - safeMarginFromTop;
            var width = deviceWidth;
            if ((height === null || height === void 0 ? void 0 : height.toFixed(0)) === ((_b = dimensions.height) === null || _b === void 0 ? void 0 : _b.toFixed(0)) &&
                (width === null || width === void 0 ? void 0 : width.toFixed(0)) === dimensions.width.toFixed(0) &&
                dimensions.portrait === isPortraitMode) {
                return;
            }
            setDimensions({
                width: isPortraitMode ? width : height,
                height: isPortraitMode ? height : width,
                portrait: isPortraitMode
            });
        });
        clearTimeout(onDeviceLayoutReset.current.timer);
        if (safeAreaPaddingTop.current !== undefined || Platform.OS !== 'ios') {
            internalEventManager.publish('safeAreaLayout');
        }
    }, [
        keyboard.keyboardShown,
        isModal,
        internalEventManager,
        dimensions.width,
        dimensions.portrait,
        dimensions.height,
    ]);
    var hideSheet = React.useCallback(function (vy, data, isSheetManagerOrRef) {
        if (hiding.current)
            return;
        if (!closable && !isSheetManagerOrRef) {
            returnAnimation(vy);
            return;
        }
        hiding.current = true;
        onBeforeClose === null || onBeforeClose === void 0 ? void 0 : onBeforeClose(data || payloadRef.current || data);
        setTimeout(function () {
            hideAnimation(vy, function (_a) {
                var _b, _c;
                var finished = _a.finished;
                if (finished) {
                    if (closable) {
                        setVisible(false);
                        if (props.onClose) {
                            (_b = props.onClose) === null || _b === void 0 ? void 0 : _b.call(props, data || payloadRef.current || data);
                            hiding.current = false;
                        }
                        (_c = hardwareBackPressEvent.current) === null || _c === void 0 ? void 0 : _c.remove();
                        if (sheetId) {
                            SheetManager.remove(sheetId, currentContext);
                            hiding.current = false;
                            actionSheetEventManager.publish("onclose_".concat(sheetId), data || payloadRef.current || data, currentContext);
                        }
                        else {
                            hiding.current = false;
                        }
                    }
                    else {
                        returnAnimation();
                    }
                }
            });
        }, 1);
        if (Platform.OS === 'web') {
            document.body.style.overflowY = 'auto';
            document.documentElement.style.overflowY = 'auto';
        }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [closable, hideAnimation, props.onClose, returnAnimation, setVisible]);
    var onHardwareBackPress = React.useCallback(function () {
        var _a, _b;
        if (visible &&
            enableRouterBackNavigation &&
            ((_a = routerRef.current) === null || _a === void 0 ? void 0 : _a.canGoBack())) {
            (_b = routerRef.current) === null || _b === void 0 ? void 0 : _b.goBack();
            return true;
        }
        if (visible && closable && closeOnPressBack) {
            hideSheet();
            return true;
        }
        return false;
    }, [
        closable,
        closeOnPressBack,
        hideSheet,
        enableRouterBackNavigation,
        visible,
    ]);
    /**
     * Snap towards the top
     */
    var snapForward = React.useCallback(function (vy) {
        if (currentSnapIndex.current === snapPoints.length - 1) {
            initialValue.current = getNextPosition(currentSnapIndex.current);
            returnAnimation(vy);
            return;
        }
        var nextSnapPoint = 0;
        var nextSnapIndex = 0;
        if (getCurrentPosition() === 0) {
            nextSnapPoint = snapPoints[(nextSnapIndex = snapPoints.length - 1)];
        }
        else {
            for (var i = currentSnapIndex.current; i < snapPoints.length; i++) {
                if (getNextPosition(i) < getCurrentPosition()) {
                    nextSnapPoint = snapPoints[(nextSnapIndex = i)];
                    break;
                }
            }
        }
        if (nextSnapPoint > 100) {
            console.warn('Snap points should range between 0 to 100.');
            returnAnimation(vy);
            return;
        }
        currentSnapIndex.current = nextSnapIndex;
        initialValue.current = getNextPosition(currentSnapIndex.current);
        returnAnimation(vy);
    }, [getCurrentPosition, getNextPosition, returnAnimation, snapPoints]);
    /**
     * Snap towards the bottom
     */
    var snapBackward = React.useCallback(function (vy) {
        if (currentSnapIndex.current === 0) {
            if (closable) {
                initialValue.current = dimensions.height * 1.3;
                hideSheet(vy);
            }
            else {
                initialValue.current = getNextPosition(currentSnapIndex.current);
                returnAnimation(vy);
            }
            return;
        }
        var nextSnapPoint = 0;
        var nextSnapIndex = 0;
        for (var i = currentSnapIndex.current; i > -1; i--) {
            if (getNextPosition(i) > getCurrentPosition()) {
                nextSnapPoint = snapPoints[(nextSnapIndex = i)];
                break;
            }
        }
        if (nextSnapPoint < 0) {
            console.warn('Snap points should range between 0 to 100.');
            returnAnimation(vy);
            return;
        }
        currentSnapIndex.current = nextSnapIndex;
        initialValue.current = getNextPosition(currentSnapIndex.current);
        returnAnimation(vy);
    }, [
        closable,
        dimensions.height,
        getCurrentPosition,
        getNextPosition,
        hideSheet,
        returnAnimation,
        snapPoints,
    ]);
    var handlers = React.useMemo(function () {
        return !gestureEnabled
            ? { panHandlers: {} }
            : PanResponder.create({
                onMoveShouldSetPanResponder: function (event, gesture) {
                    if (sheetId && !isRenderedOnTop(sheetId, currentContext))
                        return false;
                    var vy = gesture.vy < 0 ? gesture.vy * -1 : gesture.vy;
                    var vx = gesture.vx < 0 ? gesture.vx * -1 : gesture.vx;
                    if (vy < 0.05 || vx > 0.05) {
                        return false;
                    }
                    var gestures = true;
                    for (var _id in gestureBoundaries.current) {
                        var gestureBoundary = gestureBoundaries.current[_id];
                        if (getCurrentPosition() > 3 || !gestureBoundary) {
                            gestures = true;
                            break;
                        }
                        var scrollOffset = (gestureBoundary === null || gestureBoundary === void 0 ? void 0 : gestureBoundary.scrollOffset) || 0;
                        if (event.nativeEvent.locationY < (gestureBoundary === null || gestureBoundary === void 0 ? void 0 : gestureBoundary.y) ||
                            (gesture.vy > 0 && scrollOffset <= 0) ||
                            getCurrentPosition() !== 0) {
                            if (!props.enableGesturesInScrollView &&
                                Platform.OS !== 'web' &&
                                event.nativeEvent.locationY > (gestureBoundary === null || gestureBoundary === void 0 ? void 0 : gestureBoundary.y)) {
                                return false;
                            }
                            else {
                                gestures = true;
                            }
                        }
                        else {
                            gestures = false;
                            break;
                        }
                    }
                    if (Platform.OS === 'web') {
                        if (!gestures) {
                            //@ts-ignore
                            panViewRef.current.style.touchAction = 'none';
                        }
                        else {
                            //@ts-ignore
                            panViewRef.current.style.touchAction = 'auto';
                        }
                    }
                    return gestures;
                },
                onStartShouldSetPanResponder: function (event, _gesture) {
                    if (sheetId && !isRenderedOnTop(sheetId, currentContext))
                        return false;
                    var gestures = true;
                    for (var _id in gestureBoundaries.current) {
                        var gestureBoundary = gestureBoundaries.current[_id];
                        if (getCurrentPosition() > 3 || !gestureBoundary) {
                            gestures = true;
                        }
                        var scrollOffset = (gestureBoundary === null || gestureBoundary === void 0 ? void 0 : gestureBoundary.scrollOffset) || 0;
                        if (event.nativeEvent.locationY < (gestureBoundary === null || gestureBoundary === void 0 ? void 0 : gestureBoundary.y) ||
                            (scrollOffset <= 0 && getCurrentPosition() !== 0)) {
                            if (Platform.OS !== 'web') {
                                return false;
                            }
                            else {
                                gestures = true;
                            }
                        }
                        else {
                            gestures = false;
                        }
                    }
                    return gestures;
                },
                onPanResponderMove: function (_event, gesture) {
                    var value = initialValue.current + gesture.dy;
                    var correctedValue = 
                    //@ts-ignore
                    value <= minTranslateValue.current
                        ? //@ts-ignore
                            minTranslateValue.current - value
                        : //@ts-ignore
                            value;
                    if (
                    //@ts-ignore
                    correctedValue / overdrawFactor >= overdrawSize &&
                        gesture.dy <= 0) {
                        return;
                    }
                    animations.translateY.setValue(value <= minTranslateValue.current
                        ? overdrawEnabled
                            ? minTranslateValue.current -
                                correctedValue / overdrawFactor
                            : minTranslateValue.current
                        : value);
                },
                onPanResponderEnd: function (_event, gesture) {
                    var isMovingUp = getCurrentPosition() < initialValue.current;
                    if ((!isMovingUp &&
                        getCurrentPosition() <
                            initialValue.current + springOffset) ||
                        (isMovingUp &&
                            getCurrentPosition() > initialValue.current - springOffset)) {
                        returnAnimation(gesture.vy);
                        return;
                    }
                    if (!isMovingUp) {
                        snapBackward(gesture.vy);
                    }
                    else {
                        snapForward(gesture.vy);
                    }
                }
            });
    }, [
        gestureEnabled,
        sheetId,
        currentContext,
        getCurrentPosition,
        props.enableGesturesInScrollView,
        overdrawFactor,
        overdrawSize,
        animations.translateY,
        overdrawEnabled,
        springOffset,
        returnAnimation,
        snapBackward,
        snapForward,
    ]);
    var onTouch = function (event) {
        onTouchBackdrop === null || onTouchBackdrop === void 0 ? void 0 : onTouchBackdrop(event);
        if (enableRouterBackNavigation && router.canGoBack()) {
            router.goBack();
            return;
        }
        if (closeOnTouchBackdrop && closable) {
            hideSheet();
        }
    };
    var onSheetLayout = React.useCallback(function (event) {
        var _a;
        if (isOrientationChanging.current)
            return;
        var safeMarginFromTop = Platform.OS === 'ios'
            ? safeAreaPaddingTop.current || 0
            : StatusBar.currentHeight || 0;
        var windowDimensions = Dimensions.get('window');
        var height = windowDimensions.height - safeMarginFromTop;
        var orientationChanged = dimensions.portrait !==
            windowDimensions.width < windowDimensions.height;
        if (orientationChanged)
            isOrientationChanging.current = true;
        (_a = deviceContainerRef.current) === null || _a === void 0 ? void 0 : _a.setNativeProps({
            style: {
                height: Dimensions.get('screen').height - safeMarginFromTop
            }
        });
        setDimensions(function (dim) {
            return __assign(__assign({}, dim), { height: height, portrait: windowDimensions.width < windowDimensions.height });
        });
        actionSheetHeight.current =
            event.nativeEvent.layout.height > height
                ? height
                : event.nativeEvent.layout.height;
        minTranslateValue.current = height - actionSheetHeight.current;
        if (initialValue.current < 0) {
            animations.translateY.setValue(height * 1.1);
        }
        var nextInitialValue = actionSheetHeight.current +
            minTranslateValue.current -
            (actionSheetHeight.current * snapPoints[currentSnapIndex.current]) /
                100;
        initialValue.current =
            (keyboard.keyboardShown || keyboardWasVisible.current) &&
                initialValue.current <= nextInitialValue &&
                initialValue.current >= minTranslateValue.current
                ? initialValue.current
                : nextInitialValue;
        if (keyboard.keyboardShown) {
            keyboardAnimation();
            keyboardWasVisible.current = true;
            prevKeyboardHeight.current = keyboard.keyboardHeight;
        }
        else {
            keyboardWasVisible.current = false;
        }
        opacityAnimation(1);
        returnAnimation();
        if (isOrientationChanging.current) {
            setTimeout(function () {
                isOrientationChanging.current = false;
            }, 300);
        }
        if (initialValue.current > 100) {
            if (lock.current)
                return;
            animations.underlayTranslateY.setValue(100);
        }
        if (Platform.OS === 'web') {
            document.body.style.overflowY = 'hidden';
            document.documentElement.style.overflowY = 'hidden';
        }
    }, [
        snapPoints,
        keyboard.keyboardShown,
        keyboard.keyboardHeight,
        opacityAnimation,
        returnAnimation,
        keyboardAnimation,
        animations.translateY,
        animations.underlayTranslateY,
        dimensions.portrait,
    ]);
    var getRef = useCallback(function () { return ({
        show: function () {
            var _a;
            onBeforeShow === null || onBeforeShow === void 0 ? void 0 : onBeforeShow();
            (_a = routerRef.current) === null || _a === void 0 ? void 0 : _a.initialNavigation();
            setVisible(true);
        },
        hide: function (data) {
            hideSheet(undefined, data, true);
        },
        setModalVisible: function (_visible) {
            if (_visible) {
                setVisible(true);
            }
            else {
                hideSheet();
            }
        },
        snapToOffset: function (offset) {
            initialValue.current =
                actionSheetHeight.current +
                    minTranslateValue.current -
                    (actionSheetHeight.current * offset) / 100;
            Animated.spring(animations.translateY, __assign({ toValue: initialValue.current, useNativeDriver: true }, props.openAnimationConfig)).start();
        },
        snapToRelativeOffset: function (offset) {
            if (offset === 0) {
                getRef().snapToIndex(currentSnapIndex.current);
                return;
            }
            var availableHeight = actionSheetHeight.current + minTranslateValue.current;
            initialValue.current =
                initialValue.current + initialValue.current * (offset / 100);
            if (initialValue.current > availableHeight) {
                getRef().snapToOffset(100);
                return;
            }
            Animated.spring(animations.translateY, __assign({ toValue: initialValue.current, useNativeDriver: true }, props.openAnimationConfig)).start();
        },
        snapToIndex: function (index) {
            if (index > snapPoints.length || index < 0)
                return;
            currentSnapIndex.current = index;
            initialValue.current = getNextPosition(index);
            Animated.spring(animations.translateY, __assign({ toValue: initialValue.current, useNativeDriver: true }, props.openAnimationConfig)).start();
        },
        handleChildScrollEnd: function () {
            console.warn('handleChildScrollEnd has been removed. Please use `useScrollHandlers` hook to enable scrolling in ActionSheet');
        },
        modifyGesturesForLayout: function (_id, layout, scrollOffset) {
            //@ts-ignore
            gestureBoundaries.current[_id] = __assign(__assign({}, layout), { scrollOffset: scrollOffset });
        },
        isGestureEnabled: function () { return gestureEnabled; },
        isOpen: function () { return visible; },
        ev: internalEventManager
    }); }, [
        internalEventManager,
        setVisible,
        hideSheet,
        animations.translateY,
        props.openAnimationConfig,
        snapPoints.length,
        getNextPosition,
        gestureEnabled,
        visible,
        onBeforeShow,
    ]);
    useImperativeHandle(ref, getRef, [getRef]);
    useEffect(function () {
        if (sheetId) {
            SheetManager.registerRef(sheetId, currentContext, {
                current: getRef()
            });
        }
    }, [currentContext, getRef, sheetId]);
    var onRequestClose = React.useCallback(function () {
        var _a, _b;
        if (enableRouterBackNavigation && ((_a = routerRef.current) === null || _a === void 0 ? void 0 : _a.canGoBack())) {
            (_b = routerRef.current) === null || _b === void 0 ? void 0 : _b.goBack();
            return;
        }
        hideSheet();
    }, [hideSheet, enableRouterBackNavigation]);
    var rootProps = React.useMemo(function () {
        var _a, _b;
        return isModal && !props.backgroundInteractionEnabled
            ? {
                visible: true,
                animationType: 'none',
                testID: ((_a = props.testIDs) === null || _a === void 0 ? void 0 : _a.modal) || props.testID,
                supportedOrientations: SUPPORTED_ORIENTATIONS,
                onShow: props.onOpen,
                onRequestClose: onRequestClose,
                transparent: true,
                /**
                 * Always true, it causes issue with keyboard handling.
                 */
                statusBarTranslucent: true
            }
            : {
                testID: ((_b = props.testIDs) === null || _b === void 0 ? void 0 : _b.root) || props.testID,
                onLayout: function () {
                    var _a;
                    hardwareBackPressEvent.current = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
                    (_a = props === null || props === void 0 ? void 0 : props.onOpen) === null || _a === void 0 ? void 0 : _a.call(props);
                },
                style: {
                    position: 'absolute',
                    zIndex: zIndex
                        ? zIndex
                        : sheetId
                            ? getZIndexFromStack(sheetId, currentContext)
                            : 999,
                    width: '100%',
                    height: initialWindowHeight.current
                },
                pointerEvents: (props === null || props === void 0 ? void 0 : props.backgroundInteractionEnabled)
                    ? 'box-none'
                    : 'auto'
            };
    }, [
        currentContext,
        isModal,
        onHardwareBackPress,
        onRequestClose,
        props,
        zIndex,
        sheetId,
    ]);
    var renderRoute = useCallback(function (route) {
        var _a;
        var RouteComponent = route.component;
        return (<Animated.View key={route.name} style={{
                display: route.name !== ((_a = router.currentRoute) === null || _a === void 0 ? void 0 : _a.name) ? 'none' : 'flex',
                opacity: animations.routeOpacity
            }}>
            <RouterParamsContext.Provider value={route === null || route === void 0 ? void 0 : route.params}>
              <RouteComponent router={router} params={route === null || route === void 0 ? void 0 : route.params} payload={payloadRef.current}/>
            </RouterParamsContext.Provider>
          </Animated.View>);
    }, [animations.routeOpacity, router]);
    var getPaddingBottom = function () {
        var _a, _b, _c, _d, _e;
        if (!props.useBottomSafeAreaPadding && !props.containerStyle)
            return 0;
        var topPadding = !props.useBottomSafeAreaPadding
            ? 0
            : Platform.OS === 'android'
                ? StatusBar.currentHeight && StatusBar.currentHeight > 35
                    ? 35
                    : StatusBar.currentHeight
                : (safeAreaPaddingTop.current || 0) > 30
                    ? 30
                    : safeAreaPaddingTop.current;
        if (!props.useBottomSafeAreaPadding && props.containerStyle) {
            return (((_a = props.containerStyle) === null || _a === void 0 ? void 0 : _a.paddingBottom) ||
                props.containerStyle.padding ||
                0);
        }
        if (!props.containerStyle && (props === null || props === void 0 ? void 0 : props.useBottomSafeAreaPadding)) {
            return topPadding;
        }
        if (typeof ((_b = props.containerStyle) === null || _b === void 0 ? void 0 : _b.paddingBottom) === 'string')
            return props.containerStyle.paddingBottom;
        if (typeof ((_c = props.containerStyle) === null || _c === void 0 ? void 0 : _c.padding) === 'string')
            return props.containerStyle.padding;
        if ((_d = props.containerStyle) === null || _d === void 0 ? void 0 : _d.paddingBottom) {
            //@ts-ignore
            return topPadding + props.containerStyle.paddingBottom;
        }
        if ((_e = props.containerStyle) === null || _e === void 0 ? void 0 : _e.padding) {
            //@ts-ignore
            return topPadding + props.containerStyle.padding;
        }
        return topPadding;
    };
    var paddingBottom = getPaddingBottom() || 0;
    return (<>
        {Platform.OS === 'ios' && !safeAreaInsets ? (<SafeAreaView pointerEvents="none" collapsable={false} onLayout={function (event) {
                var height = event.nativeEvent.layout.height;
                if (height !== undefined) {
                    safeAreaPaddingTop.current = height;
                    clearTimeout(onDeviceLayoutReset.current.timer);
                    onDeviceLayoutReset.current.timer = setTimeout(function () {
                        internalEventManager.publish('safeAreaLayout');
                    }, 64);
                }
            }} style={{
                position: 'absolute',
                width: 1,
                left: 0,
                top: 0,
                backgroundColor: 'transparent'
            }}>
            <View />
          </SafeAreaView>) : null}
        {visible ? (<Root {...rootProps}>
            <Animated.View onLayout={onDeviceLayout} ref={deviceContainerRef} pointerEvents={(props === null || props === void 0 ? void 0 : props.backgroundInteractionEnabled) ? 'box-none' : 'auto'} style={[
                styles.parentContainer,
                {
                    opacity: animations.opacity,
                    width: '100%',
                    justifyContent: 'flex-end',
                    transform: [
                        {
                            translateY: animations.keyboardTranslate
                        },
                    ]
                },
            ]}>
              {!(props === null || props === void 0 ? void 0 : props.backgroundInteractionEnabled) ? (<TouchableOpacity onPress={onTouch} activeOpacity={defaultOverlayOpacity} testID={(_b = props.testIDs) === null || _b === void 0 ? void 0 : _b.backdrop} style={{
                    height: dimensions.height +
                        (safeAreaPaddingTop.current || 0) +
                        100,
                    width: '100%',
                    position: 'absolute',
                    backgroundColor: overlayColor,
                    opacity: defaultOverlayOpacity
                }} {...(props.backdropProps ? props.backdropProps : {})}/>) : null}

              <Animated.View pointerEvents="box-none" style={__assign(__assign({ borderTopRightRadius: ((_c = props.containerStyle) === null || _c === void 0 ? void 0 : _c.borderTopRightRadius) || 10, borderTopLeftRadius: ((_d = props.containerStyle) === null || _d === void 0 ? void 0 : _d.borderTopLeftRadius) || 10, backgroundColor: ((_e = props.containerStyle) === null || _e === void 0 ? void 0 : _e.backgroundColor) || 'white', borderBottomLeftRadius: ((_f = props.containerStyle) === null || _f === void 0 ? void 0 : _f.borderBottomLeftRadius) || undefined, borderBottomRightRadius: ((_g = props.containerStyle) === null || _g === void 0 ? void 0 : _g.borderBottomRightRadius) || undefined, borderRadius: ((_h = props.containerStyle) === null || _h === void 0 ? void 0 : _h.borderRadius) || undefined, width: ((_j = props.containerStyle) === null || _j === void 0 ? void 0 : _j.width) || '100%' }, getElevation(typeof elevation === 'number' ? elevation : 5)), { flex: undefined, height: dimensions.height, maxHeight: dimensions.height, paddingBottom: keyboard.keyboardShown
                    ? keyboard.keyboardHeight || 0
                    : 0, 
                //zIndex: 10,
                transform: [
                    {
                        translateY: animations.translateY
                    },
                ] })}>
                {dimensions.height === 0 ? null : (<Animated.View {...handlers.panHandlers} onLayout={onSheetLayout} ref={panViewRef} testID={(_k = props.testIDs) === null || _k === void 0 ? void 0 : _k.sheet} style={[
                    styles.container,
                    {
                        borderTopRightRadius: 10,
                        borderTopLeftRadius: 10
                    },
                    props.containerStyle,
                    {
                        paddingBottom: keyboard.keyboardShown &&
                            typeof paddingBottom !== 'string'
                            ? paddingBottom + 2
                            : paddingBottom,
                        maxHeight: keyboard.keyboardShown
                            ? dimensions.height - keyboard.keyboardHeight
                            : dimensions.height
                    },
                    {
                        overflow: 'hidden'
                    },
                ]}>
                    {drawUnderStatusBar ? (<Animated.View style={{
                        height: 100,
                        position: 'absolute',
                        top: -50,
                        backgroundColor: ((_l = props.containerStyle) === null || _l === void 0 ? void 0 : _l.backgroundColor) || 'white',
                        width: '100%',
                        borderTopRightRadius: ((_m = props.containerStyle) === null || _m === void 0 ? void 0 : _m.borderRadius) || 10,
                        borderTopLeftRadius: ((_o = props.containerStyle) === null || _o === void 0 ? void 0 : _o.borderRadius) || 10,
                        transform: [
                            {
                                translateY: animations.underlayTranslateY
                            },
                        ]
                    }}/>) : null}
                    {gestureEnabled || props.headerAlwaysVisible ? (props.CustomHeaderComponent ? (props.CustomHeaderComponent) : (<Animated.View style={[styles.indicator, props.indicatorStyle]}/>)) : null}

                    {(router === null || router === void 0 ? void 0 : router.hasRoutes()) ? (<RouterContext.Provider value={router}>
                        {router === null || router === void 0 ? void 0 : router.stack.map(renderRoute)}
                      </RouterContext.Provider>) : (props === null || props === void 0 ? void 0 : props.children)}
                  </Animated.View>)}
                {overdrawEnabled ? (<Animated.View style={{
                    position: 'absolute',
                    height: overdrawSize,
                    bottom: -overdrawSize,
                    backgroundColor: ((_p = props.containerStyle) === null || _p === void 0 ? void 0 : _p.backgroundColor) || 'white',
                    width: ((_q = props.containerStyle) === null || _q === void 0 ? void 0 : _q.width) || dimensions.width
                }}/>) : null}
              </Animated.View>
              {ExtraOverlayComponent}
              {props.withNestedSheetProvider}
              {sheetId ? (<SheetProvider context={"$$-auto-".concat(sheetId, "-").concat(currentContext, "-provider")}/>) : null}
            </Animated.View>
          </Root>) : null}
      </>);
});
