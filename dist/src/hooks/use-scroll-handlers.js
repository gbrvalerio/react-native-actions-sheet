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
/* eslint-disable curly */
import React, { useEffect, useRef } from 'react';
import { Platform, } from 'react-native';
/**
 * If you are using a `ScrollView` or `FlatList` in ActionSheet. You must attach `scrollHandlers`
 * with it to enable vertical scrolling. For horizontal ScrollViews, you should not use this hook.
 * @param id Id for the handler. Could be any string value.
 * @param ref ref of the ActionSheet in which the ScrollView is present.
 * @param minGesutureBoundary The minimum area of scrollView from top, where swipe gestures are allowed always.
 * @returns
 */
export function useScrollHandlers(id, ref, minGesutureBoundary) {
    if (minGesutureBoundary === void 0) { minGesutureBoundary = 50; }
    var scrollRef = useRef(null);
    var scrollLayout = useRef();
    var scrollOffset = useRef(0);
    var prevState = useRef(false);
    var subscription = useRef();
    var onScroll = function (event) {
        var _a;
        scrollOffset.current = event.nativeEvent.contentOffset.y;
        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.modifyGesturesForLayout(id, scrollLayout.current, scrollOffset.current);
    };
    var disableScrolling = React.useCallback(function () {
        if (Platform.OS === 'web') {
            //@ts-ignore
            scrollRef.current.style.touchAction = 'none';
            //@ts-ignore
            scrollRef.current.style.overflowY = 'hidden';
        }
    }, [scrollRef]);
    var enableScrolling = React.useCallback(function () {
        if (Platform.OS === 'web') {
            //@ts-ignore
            scrollRef.current.style.overflowY = 'scroll';
            //@ts-ignore
            scrollRef.current.style.touchAction = 'auto';
        }
    }, [scrollRef]);
    useEffect(function () {
        return function () {
            var _a;
            (_a = subscription.current) === null || _a === void 0 ? void 0 : _a.unsubscribe();
        };
    }, [id, ref, disableScrolling, enableScrolling]);
    var onLayout = function (event) {
        var _a, _b;
        scrollLayout.current = __assign(__assign({}, event.nativeEvent.layout), { y: event.nativeEvent.layout.y || minGesutureBoundary });
        subscription.current = (_a = ref.current) === null || _a === void 0 ? void 0 : _a.ev.subscribe('onoffsetchange', function (offset) {
            var _a;
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.modifyGesturesForLayout(id, scrollLayout.current, scrollOffset.current);
            if (offset < 3) {
                if (prevState.current)
                    return;
                prevState.current = true;
                enableScrolling();
            }
            else {
                if (!prevState.current)
                    return;
                prevState.current = false;
                disableScrolling();
            }
        });
        (_b = ref.current) === null || _b === void 0 ? void 0 : _b.modifyGesturesForLayout(id, __assign(__assign({}, scrollLayout.current), { y: scrollLayout.current.y || minGesutureBoundary }), scrollOffset.current);
    };
    return {
        scrollEnabled: true,
        onScroll: onScroll,
        ref: scrollRef,
        onLayout: onLayout,
        scrollEventThrottle: 50
    };
}
