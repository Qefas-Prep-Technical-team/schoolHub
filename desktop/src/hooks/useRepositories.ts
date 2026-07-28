import { useMemo } from "react";
import {
  UserRepository,
  TodoRepository,
  NotificationRepository,
  SettingsRepository,
  MessageRepository,
  DraftRepository,
  SyncQueueRepository,
} from "../repositories";

let userRepoInstance: UserRepository | null = null;
let todoRepoInstance: TodoRepository | null = null;
let notificationRepoInstance: NotificationRepository | null = null;
let settingsRepoInstance: SettingsRepository | null = null;
let messageRepoInstance: MessageRepository | null = null;
let draftRepoInstance: DraftRepository | null = null;
let syncQueueRepoInstance: SyncQueueRepository | null = null;

export const useRepositories = () => {
  return useMemo(() => {
    if (!userRepoInstance) userRepoInstance = new UserRepository();
    if (!todoRepoInstance) todoRepoInstance = new TodoRepository();
    if (!notificationRepoInstance) notificationRepoInstance = new NotificationRepository();
    if (!settingsRepoInstance) settingsRepoInstance = new SettingsRepository();
    if (!messageRepoInstance) messageRepoInstance = new MessageRepository();
    if (!draftRepoInstance) draftRepoInstance = new DraftRepository();
    if (!syncQueueRepoInstance) syncQueueRepoInstance = new SyncQueueRepository();

    return {
      userRepo: userRepoInstance,
      todoRepo: todoRepoInstance,
      notificationRepo: notificationRepoInstance,
      settingsRepo: settingsRepoInstance,
      messageRepo: messageRepoInstance,
      draftRepo: draftRepoInstance,
      syncQueueRepo: syncQueueRepoInstance,
    };
  }, []);
};
