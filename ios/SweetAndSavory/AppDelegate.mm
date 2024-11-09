#import "AppDelegate.h"
#import <Firebase.h>
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>
#import <React/RCTBundleURLProvider.h>
#import <RNPermissions/RNPermissions.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"SweetAndSavory";
  self.initialProps = @{};

  // Configure Firebase without initializing Analytics
  [FIRApp configure];

  // Initialize Firebase services selectively
  [self initializeFirebaseServices];

  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];

  // Request notification permissions
  UNAuthorizationOptions authOptions = UNAuthorizationOptionAlert |
                                        UNAuthorizationOptionSound |
                                        UNAuthorizationOptionBadge;
  [center requestAuthorizationWithOptions:authOptions
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
      // Handle the error if needed
  }];

  [application registerForRemoteNotifications];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (void)initializeFirebaseServices {
    // Only initialize services you need immediately, excluding Analytics
    // For example, Firebase Messaging:
    [FIRMessaging messaging];
    // Initialize other Firebase services as needed here
}

// Method to enable Firebase Analytics when ready (e.g., after splash screen)
- (void)enableFirebaseAnalytics {
    [FIRAnalytics setAnalyticsCollectionEnabled:YES];
}

// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
  [FIRMessaging messaging].APNSToken = deviceToken;
}

// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
  completionHandler(UIBackgroundFetchResultNewData);
}

// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}

// Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
  completionHandler();
}

// Called when a notification is delivered to a foreground app.
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
