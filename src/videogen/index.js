const ffmpeg = require('fluent-ffmpeg');
const config = require('config');
const path = require('path');
const logger = require('../logger')('[GENERATE]');

module.exports = (inputFile, outputFile, { discordTag, videoGenPath, id }) => {
  return new Promise((resolve, reject) => {
    logger.info(`Probing ${id}...`);
    ffmpeg.ffprobe(inputFile, (error, metadata) => {
      if(error) return reject(error);
      const duration = parseInt(metadata.format.duration) >= config.get('video.duration') ? config.get('video.duration') : metadata.format.duration;
      const inputWidth = metadata.streams[0].width;
      const inputHeight = metadata.streams[0].height;
      const outputFontSize = (Math.sqrt(Math.pow(inputWidth, 2) + Math.pow(inputHeight, 2)) / 1468.6 * 72) * config.get('video.textScale');
      const filters = [{
        filter: 'volume',
        options: {
          enable: `between(t,0,${duration}/2)`,
          volume: '0.25',
        },
        inputs: metadata.streams.length >= 2 ? '0:a' : '2:a',
        outputs: 'audio1',
      }, {
        filter: 'volume',
        options: {
          enable: `between(t,${duration}/2, ${duration})`,
          volume: '5',
        },
        inputs: 'audio1',
        outputs: 'audio2',
      }, {
        filter: 'atrim',
        options: {
          duration: duration,
        },
        inputs: 'audio2',
        outputs: 'audioFinal',
      }, {
        filter: 'frei0r',
        options: {
          filter_name: 'pixeliz0r',
        },
        inputs: '0:v',
        outputs: 'video1',
      }, {
        filter: 'drawtext',
        options: {
          fontfile: '\'./assets/DejaVuSans.ttf\'',
          text: config.get('video.handle'),
          fontcolor: 'white',
          fontsize: outputFontSize.toString(),
          box: '1',
          boxcolor: 'black@0.5',
          boxborderw: '5',
          x: '(w-text_w)',
          y: '0',
        },
        inputs: 'video1',
        outputs: 'video2',
      }, {
        filter: 'drawtext',
        options: {
          fontfile: '\'./assets/DejaVuSans.ttf\'',
          text: discordTag,
          fontcolor: 'white',
          fontsize: outputFontSize.toString(),
          box: '1',
          boxcolor: 'black@0.5',
          boxborderw: '5',
          x: '0',
          y: '0',
        },
        inputs: 'video2',
        outputs: 'video3',
      }, {
        filter: 'drawtext',
        options: {
          fontfile: '\'./assets/DejaVuSans-Bold.ttf\'',
          text: config.get('video.watermark'),
          fontcolor: 'white@0.3',
          fontsize: outputFontSize.toString(),
          shadowcolor: 'black',
          shadowx: '2',
          shadowy: '2',
          x: '(w-text_w)/2',
          y: '(h-text_h)/2',
        },
        inputs: 'video3',
        outputs: 'video4',
      }, {
        filter: 'drawtext',
        options: {
          fontfile: '\'./assets/Topaz.ttf\'',
          text: config.get('video.marquee'),
          fontcolor: 'white',
          fontsize: outputFontSize.toString(),
          y: 'h-line_h-10',
          x: 'w-mod(max(t-4.5\\,0)*(w+tw)/7.5\\,(w+tw))',
        },
        inputs: 'video4',
        outputs: 'video5',
      }, {
        filter: 'scale',
        options: {
          h: '240',
          w: '320',
        },
        inputs: 'video5',
        outputs: 'video6',
      }, {
        filter: 'setsar',
        options: {
          sar: '1',
        },
        inputs: 'video6',
        outputs: 'video7',
      }, {
        filter: 'trim',
        options: { duration },
        inputs: 'video7',
        outputs: 'videoFinal',
      }, {
        filter: 'concat',
        options: {
          n: 2,
          v: 1,
          a: 1,
        },
        inputs: ['videoFinal', 'audioFinal', '1:v', '1:a'],
        outputs: ['v', 'a'],
      }];

      logger.info(`Generating ${id}...`);
      ffmpeg(inputFile)
        .input(path.join(videoGenPath, './assets/outro.mp4'))
        .duration(duration + 5)
        .videoBitrate(150)
        .fps(5)
        .input('anullsrc')
        .inputFormat('lavfi')
        .audioChannels(1)
        .audioBitrate(8)
        .complexFilter(filters, ['v', 'a'])
        .on('error', reject)
        .on('end', () => resolve(outputFile))
        .save(outputFile);
    });
  });
};