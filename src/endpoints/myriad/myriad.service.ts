import { keyList } from '@common/secrets';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import {
  CACHE_MANAGER,
  Inject,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';
import { AuthUserInterface } from './interface/auth-user';
import {
  ContentInterface,
  NetworkTypeEnum,
  ReferenceTypeEnum,
  StatusEnum,
  SymbolEnum,
} from './interface/content';
import { E_PostType, E_Visibility, Post } from './interface/post';
import { UserMyriadInterface } from './interface/user';
import { UsernameCheckInterface } from './interface/username-check';
import { MyriadAccount } from './models/myriad-account.entity';
import { Cache } from 'cache-manager';

@Injectable()
export class MyriadService {
  private readonly logger: Logger = new Logger(MyriadService.name);
  private myriadEndPoints: string;

  constructor(
    @InjectRepository(MyriadAccount)
    private readonly myriadAccountRepository: Repository<MyriadAccount>,
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.myriadEndPoints = this.gCloudSecretManagerService
      .getSecret('MYRIAD_API_URL')
      .toString();
  }

  public async checkUsernameMyriad(username: string): Promise<boolean> {
    try {
      const res = await axios.get<any, AxiosResponse<UsernameCheckInterface>>(
        `${this.myriadEndPoints}/users/username/${username}`,
      );
      return res.data.status;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async customVisibilityTimeline(
    selectedUser: string[],
    timelineid: string,
  ) {
    try {
      let adminToken = await this.cacheManager.get<string>('admin_token');
      if (!adminToken) {
        const user = await this.myriadAccountRepository.findOne({
          select: ['username', 'jwt_token'],
          where: {
            username: this.gCloudSecretManagerService
              .getSecret('MYRIAD_ADMIN_USERNAME')
              .toString(),
          },
        });

        adminToken = user.jwt_token;
      }

      const patchTimeline = await axios.patch(
        `${this.myriadEndPoints}/user/experiences/${timelineid}`,
        {
          visibility: 'selected_user',
          selectedUserIds: selectedUser,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );

      return patchTimeline.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async getCustomTimeline(userId: string, jwt: string) {
    try {
      const res = await axios.get(`${this.myriadEndPoints}/experiences`, {
        params: {
          visibility: 'selected_user',
          userId: userId,
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      return res.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async getTotalPaidContentComment(userid: string, jwt: string) {
    try {
      const res = await axios.get(
        `${this.myriadEndPoints}/user/comments/count`,
        {
          params: {
            where: {
              'asset.exclusiveContents': { exists: true },
              userId: userid,
            },
          },
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      return res.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async getTotalTipFromUser(
    referenceType: ReferenceTypeEnum,
    networkType: NetworkTypeEnum,
    symbol: SymbolEnum,
    status: StatusEnum,
    jwt: string,
  ) {
    try {
      const res = await axios.get(
        `${this.myriadEndPoints}/user/transactions/${status}/total`,
        {
          params: {
            referenceType,
            networkType,
            symbol,
          },
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      return res.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async registerMyriadUser({
    username,
    name,
    address,
    role,
  }: {
    username: string;
    name: string;
    address: string;
    role: string;
  }) {
    try {
      const res = await axios.post<any, AxiosResponse<UserMyriadInterface>>(
        `${this.myriadEndPoints}/authentication/signup/wallet`,
        {
          username: username,
          name: name,
          address: address,
          network: 'debio',
        },
      );

      const { id } = res.data;

      await this.myriadAccountRepository.insert({
        address: address,
        username: username,
        role: role ?? '',
        jwt_token: '',
        user_id: id,
      });

      return res.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async authMyriadUser({
    nonce,
    publicAddress,
    signature,
    walletType,
    networkType,
    role,
  }: {
    nonce: number;
    publicAddress: string;
    signature: string;
    walletType: string;
    networkType: string;
    role: string;
  }) {
    try {
      const {
        data: { token },
      } = await axios.post<any, AxiosResponse<AuthUserInterface>>(
        `${this.myriadEndPoints}/authentication/login/wallet`,
        {
          nonce,
          publicAddress,
          signature,
          walletType,
          networkType,
          role,
        },
      );

      const account = await this.myriadAccountRepository.findOne({
        where: {
          address: publicAddress,
          role: role,
        },
      });

      if (account) {
        await this.myriadAccountRepository.update(
          { id: account.id },
          {
            jwt_token: token.accessToken,
          },
        );

        return {
          status: 200,
          jwt: token.accessToken,
        };
      } else {
        throw new Error('account_not_found');
      }
    } catch (err) {
      this.logger.error(err);

      if (err?.message === 'account_not_found') {
        throw new HttpException(
          {
            status: 400,
            message: 'account not found',
          },
          400,
        );
      } else {
        throw new HttpException(
          err?.response?.data ?? {
            status: 500,
            message: 'Something went wrong in server',
          },
          err?.response?.status ?? 500,
        );
      }
    }
  }

  public async unlockableContent(jwt: string, page?: number, limit?: number) {
    try {
      const res = await axios.get<any, AxiosResponse<ContentInterface[]>>(
        `${this.myriadEndPoints}/user/comments`,
        {
          params: {
            filter: {
              include: [
                {
                  relation: 'post',
                  scope: {
                    include: [
                      {
                        relation: 'experiences',
                        scope: {
                          where: {
                            visibility: 'selected_user',
                          },
                        },
                      },
                      { relation: 'user' },
                    ],
                  },
                },
              ],
            },
            exclusiveInfo: true,
            pageNumber: page,
            pageLimit: limit,
          },
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      console.log(res.request);

      const content: ContentInterface[] = res.data;

      return content;
    } catch (err) {
      console.log(err);
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async editProfile({
    name,
    bio,
    websiteURL,
    jwt,
  }: {
    name?: string;
    bio?: string;
    websiteURL?: string;
    jwt: string;
  }) {
    try {
      const res = await axios.patch(
        `${this.myriadEndPoints}/user/me`,
        {
          name,
          bio,
          websiteURL,
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      return res.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async getNonce({ hexWalletAddress }: { hexWalletAddress: string }) {
    try {
      const res = await axios.get(
        `${this.myriadEndPoints}/authentication/nonce`,
        {
          params: {
            id: hexWalletAddress,
            type: 'wallet',
          },
        },
      );

      return res.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async postToMyriad({
    createdBy,
    isNSFW,
    visibility,
    text,
    rawText,
    selectedUserIds,
    jwt,
    postType,
  }: {
    createdBy: string;
    isNSFW: boolean;
    rawText: string;
    text: string;
    selectedUserIds?: string[];
    visibility: E_Visibility;
    jwt: string;
    postType: E_PostType;
  }) {
    try {
      const res = await axios.post<any, AxiosResponse<Post>>(
        `${this.myriadEndPoints}/user/posts`,
        {
          createdBy: createdBy,
          isNSFW: isNSFW,
          mentions: [],
          rawText: rawText,
          status: 'published',
          tags: [],
          text: text,
          selectedUserIds: selectedUserIds,
          visibility: visibility,
          selectedTimelineIds: [],
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      this.addPostToTimeline(jwt, res.data.id, postType);

      return res.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  private async addPostToTimeline(
    jwt: string,
    postId: string,
    postType: E_PostType,
  ) {
    try {
      let adminToken = await this.cacheManager.get<string>('admin_token');
      if (!adminToken) {
        const user = await this.myriadAccountRepository.findOne({
          select: ['username', 'jwt_token'],
          where: {
            username: this.gCloudSecretManagerService
              .getSecret('MYRIAD_ADMIN_USERNAME')
              .toString(),
          },
        });

        adminToken = user.jwt_token;
      }

      await axios.post(
        `${this.myriadEndPoints}/experiences/post`,
        {
          experienceIds: [this.getExperienceIdAdmin(postType)],
          postId: postId,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  private getExperienceIdAdmin(type: string): string {
    if (type === E_PostType.PHYSICAL_HEALTH) {
      return this.gCloudSecretManagerService
        .getSecret('MYRIAD_PHYSICAL_HEALTH_TIMELINE_ID')
        .toString();
    } else if (type === E_PostType.MENTAL_HEALTH) {
      return this.gCloudSecretManagerService
        .getSecret('MYRIAD_MENTAL_HEALTH_TIMELINE_ID')
        .toString();
    } else {
      throw new HttpException(
        {
          status: 422,
          message: 'Unprocessable Entity',
        },
        422,
      );
    }
  }

  public async checkUserMyriadTable(address: string) {
    const user = await this.myriadAccountRepository.findOneBy({
      address: address,
    });

    return this.checkJWT(user);
  }

  private checkJWT(myriadAccount: MyriadAccount) {
    if (myriadAccount === null) {
      throw new HttpException(
        {
          status: 404,
          message: 'user not found',
        },
        404,
      );
    }
    if (
      myriadAccount.jwt_token === '' ||
      myriadAccount.jwt_token === null ||
      myriadAccount.user_id === '' ||
      myriadAccount.user_id === null
    ) {
      throw new HttpException(
        {
          status: 401,
          message: 'user unauthenticated',
        },
        401,
      );
    } else {
      return {
        status: 200,
        jwt: myriadAccount.jwt_token,
        user_id: myriadAccount.user_id,
      };
    }
  }

  public async getListUserId(role: string) {
    try {
      const list = await this.myriadAccountRepository.find({
        select: ['user_id', 'role'],
        where: {
          role: role,
        },
      });

      return list;
    } catch (err) {
      throw new HttpException(
        {
          status: 500,
          message: err.message,
        },
        500,
      );
    }
  }
}
