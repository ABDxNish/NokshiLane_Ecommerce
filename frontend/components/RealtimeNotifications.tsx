'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import Pusher from 'pusher-js';

import {
  useAuth,
} from './AuthProvider';


type NotificationPayload = {
  title?: string;
  message?: string;
  orderId?: string;
};


export default function RealtimeNotifications() {
  const {
    user,
  } =
    useAuth();


  const [
    notification,
    setNotification,
  ] =
    useState<NotificationPayload | null>(
      null,
    );


  const timeoutRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(
      null,
    );


  useEffect(() => {
    const key =
      process.env
        .NEXT_PUBLIC_PUSHER_KEY;


    const cluster =
      process.env
        .NEXT_PUBLIC_PUSHER_CLUSTER ||
      'ap2';


    if (
      !user ||
      !key
    ) {
      return;
    }


    const pusher =
      new Pusher(
        key,
        {
          cluster,
        },
      );


    // =====================================================
    // DISPLAY NOTIFICATION
    // =====================================================

    function showNotification(
      payload:
        NotificationPayload,
    ) {
      /*
       * Clear previous timeout.
       *
       * Otherwise an older notification
       * could hide a newer notification.
       */
      if (
        timeoutRef.current
      ) {
        clearTimeout(
          timeoutRef.current,
        );
      }


      setNotification({
        title:
          payload.title ||
          'NokshiLane',

        message:
          payload.message ||
          'You have a new notification.',

        orderId:
          payload.orderId,
      });


      timeoutRef.current =
        setTimeout(
          () => {
            setNotification(
              null,
            );

            timeoutRef.current =
              null;
          },
          6000,
        );
    }


    // =====================================================
    // CUSTOMER / USER CHANNEL
    // =====================================================

    const userChannelName =
      `user-${user.id}`;


    const userChannel =
      pusher.subscribe(
        userChannelName,
      );


    userChannel.bind(
      'notification',
      (
        payload:
          NotificationPayload,
      ) => {
        showNotification(
          payload,
        );
      },
    );


    // =====================================================
    // ADMIN CHANNEL
    // =====================================================

    let adminChannel:
      ReturnType<
        typeof pusher.subscribe
      > | null =
      null;


    if (
      user.role ===
      'ADMIN'
    ) {
      adminChannel =
        pusher.subscribe(
          'admin-orders',
        );


      adminChannel.bind(
        'order-created',
        (
          payload:
            NotificationPayload,
        ) => {
          showNotification({
            title:
              payload.title ||
              'New order received',

            message:
              payload.message ||
              'A customer placed a new order.',

            orderId:
              payload.orderId,
          });
        },
      );
    }


    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {
      if (
        timeoutRef.current
      ) {
        clearTimeout(
          timeoutRef.current,
        );

        timeoutRef.current =
          null;
      }


      userChannel
        .unbind_all();


      pusher.unsubscribe(
        userChannelName,
      );


      if (
        adminChannel
      ) {
        adminChannel
          .unbind_all();

        pusher.unsubscribe(
          'admin-orders',
        );
      }


      pusher.disconnect();
    };
  }, [
    user?.id,
    user?.role,
  ]);


  // =======================================================
  // NOTHING TO DISPLAY
  // =======================================================

  if (
    !notification
  ) {
    return null;
  }


  // =======================================================
  // TOAST
  // =======================================================

  return (
    <div
      className="nl-realtime-toast"
      role="status"
      aria-live="polite"
    >
      <div className="nl-toast-icon">
        {user?.role ===
        'ADMIN'
          ? '✦'
          : '✓'}
      </div>


      <div className="nl-toast-content">
        <strong>
          {
            notification.title
          }
        </strong>

        <p>
          {
            notification.message
          }
        </p>
      </div>


      <button
        type="button"
        className="nl-toast-close"
        aria-label="Close notification"
        onClick={() => {
          if (
            timeoutRef.current
          ) {
            clearTimeout(
              timeoutRef.current,
            );

            timeoutRef.current =
              null;
          }

          setNotification(
            null,
          );
        }}
      >
        ×
      </button>
    </div>
  );
}